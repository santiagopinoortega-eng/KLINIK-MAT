import { prismaRO } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import type { CasoClient, Paso, McqOpcion } from "@/lib/types";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { CaseStructuredData, BreadcrumbStructuredData } from "@/app/components/StructuredData";
import { auth } from "@clerk/nextjs/server";
import { canAccessNewCase } from "@/lib/subscription";

// ISR: Regenerar cada 2 horas (casos clínicos cambian ocasionalmente)
export const revalidate = 7200;

// Pre-renderizar casos más populares en build time
export async function generateStaticParams() {
  const casos = await prismaRO.case.findMany({
    where: { isPublic: true },
    select: { id: true },
    take: 20, // Pre-renderizar los primeros 20 casos
  });

  return casos.map((caso) => ({
    id: caso.id,
  }));
}

// Metadata dinámica para cada caso (SEO optimizado)
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const caso = await prismaRO.case.findUnique({
    where: { id: params.id },
    select: { 
      title: true, 
      area: true, 
      difficulty: true,
      questions: true,
    },
  });

  if (!caso) {
    return {
      title: 'Caso no encontrado',
    };
  }

  const areaMap: Record<string, string> = {
    'ginecologia': 'Ginecología',
    'obstetricia': 'Obstetricia',
    'neonatologia': 'Neonatología',
    'ssr': 'Salud Sexual y Reproductiva',
  };

  const difficultyMap: Record<string, string> = {
    'facil': 'Fácil',
    'medio': 'Medio',
    'dificil': 'Difícil',
  };

  const areaLabel = areaMap[caso.area] || caso.area;
  const difficultyLabel = difficultyMap[caso.difficulty] || caso.difficulty;
  const stepCount = Array.isArray(caso.questions) ? caso.questions.length : 0;

  return {
    title: `${caso.title} — Caso Clínico de ${areaLabel}`,
    description: `Caso clínico de ${areaLabel} nivel ${difficultyLabel}. ${stepCount} pasos interactivos para practicar razonamiento clínico. Basado en protocolos MINSAL.`,
    keywords: [
      caso.title,
      `caso ${areaLabel.toLowerCase()}`,
      `caso ${String(difficultyLabel).toLowerCase()}`,
      'caso clínico interactivo',
      'MINSAL',
    ],
    openGraph: {
      title: `${caso.title} | KLINIK-MAT`,
      description: `Caso clínico de ${areaLabel} nivel ${difficultyLabel}`,
      type: 'article',
    },
  };
}

// Carga dinámica del cliente para evitar errores de hidratación
const CasoInteractiveUI = dynamic(
  () => import("@/app/components/CasoInteractiveUI"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-lg text-neutral-500 animate-pulse">
          Cargando caso clínico...
        </div>
      </div>
    ),
  }
);

const CaseAccessGuard = dynamic(
  () => import("@/app/components/CaseAccessGuard"),
  {
    ssr: false,
  }
);

interface PageProps {
  params: { id: string };
}

function normalizarDatosDelCaso(casoDesdeDB: any): CasoClient | null {
  if (!casoDesdeDB) return null;

  // Si el caso viene en formato relacional (questions + options), normalizamos desde ahí
  if (Array.isArray(casoDesdeDB.questions)) {
    const pasosNormalizados: Paso[] = casoDesdeDB.questions
      .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
      .map((q: any) => {
        const opciones = Array.isArray(q.options)
          ? q.options.map((opt: any) => ({
              id: opt.id,
              texto: opt.text || opt.texto || '',
              esCorrecta: !!opt.isCorrect || !!opt.esCorrecta || false,
              explicacion: opt.feedback || opt.explicacion || '',
            }))
          : [];

        if (opciones.length > 0) {
          return {
            id: q.id,
            tipo: 'mcq',
            enunciado: q.text || q.enunciado || '',
            opciones,
            feedbackDocente: q.feedback || q.feedbackDocente || undefined,
          };
        }

        return {
          id: q.id,
          tipo: 'short',
          enunciado: q.text || q.enunciado || '',
          guia: q.guia || undefined,
          feedbackDocente: q.feedback || q.feedbackDocente || undefined,
        };
      });

    return {
      id: casoDesdeDB.id,
      titulo: casoDesdeDB.title || casoDesdeDB.titulo || '',
      modulo: casoDesdeDB.modulo || casoDesdeDB.area || undefined,
      area: casoDesdeDB.area || casoDesdeDB.modulo || '',
      dificultad: casoDesdeDB.dificultad || casoDesdeDB.difficulty || 2,
      vigneta: casoDesdeDB.vignette || casoDesdeDB.vigneta || null,
      pasos: pasosNormalizados,
      referencias: (casoDesdeDB.norms || []).map((n: any) => n.name || n.code || ''),
      debrief: casoDesdeDB.summary || casoDesdeDB.debrief || null,
      feedback_dinamico: casoDesdeDB.feedbackDinamico || casoDesdeDB.feedback_dinamico || undefined,
    };
  }

  // Fallback: si el caso tiene un campo `contenido` con la estructura anterior
  if (typeof casoDesdeDB.contenido === 'object' && casoDesdeDB.contenido !== null) {
    const contenido = casoDesdeDB.contenido as any;
    const pasosNormalizados: Paso[] = (contenido.pasos || []).map((paso: any, index: number): Paso => {
      if (paso.tipo === 'mcq') {
        const opciones: McqOpcion[] = (paso.opciones || []).map((opt: any, optIndex: number) => ({
          id: opt.id || `opt-${index}-${optIndex}`,
          texto: opt.texto || '',
          esCorrecta: !!opt.esCorrecta,
          explicacion: opt.explicacion || '',
        }));
        return {
          id: paso.id || `paso-${index}`,
          tipo: 'mcq',
          enunciado: paso.enunciado || '',
          opciones: opciones,
          feedbackDocente: paso.feedbackDocente,
        };
      } else {
        return {
          id: paso.id || `paso-${index}`,
          tipo: 'short',
          enunciado: paso.enunciado || '',
          guia: paso.guia,
          feedbackDocente: paso.feedbackDocente,
        };
      }
    });

    return {
      id: casoDesdeDB.id,
      titulo: casoDesdeDB.titulo || casoDesdeDB.title || '',
      modulo: contenido.modulo || casoDesdeDB.modulo || undefined,
      area: casoDesdeDB.area || contenido.modulo || '',
      dificultad: contenido.dificultad || casoDesdeDB.dificultad || casoDesdeDB.difficulty || 2,
      vigneta: contenido.vigneta || null,
      pasos: pasosNormalizados,
      referencias: contenido.referencias || [],
      debrief: contenido.debrief || null,
      feedback_dinamico: casoDesdeDB.feedbackDinamico || contenido.feedbackDinamico || contenido.feedback_dinamico || undefined,
    };
  }

  return null;
}

export default async function CasoPage({ params }: PageProps) {
  const casoDesdeDB = await prismaRO.case.findUnique({
    where: { id: params.id },
    include: {
      questions: { include: { options: true } },
      norms: true,
    },
  });

  if (!casoDesdeDB) {
    notFound();
  }

  const casoClient = normalizarDatosDelCaso(casoDesdeDB);

  if (!casoClient) {
    return (
      <div className="p-8 text-danger-500 bg-danger-50 rounded-lg border border-danger-200">
        Error: No se pudieron procesar los datos de este caso clínico.
      </div>
    );
  }

  const areaMap: Record<string, string> = {
    'ginecologia': 'Ginecología',
    'obstetricia': 'Obstetricia',
    'neonatologia': 'Neonatología',
    'ssr': 'Salud Sexual y Reproductiva',
  };

  return (
    <div className="min-h-screen bg-[var(--km-surface-2)] pb-16">
      {/* Structured Data para SEO */}
      <CaseStructuredData
        title={casoClient.titulo}
        area={casoClient.area || 'general'}
        difficulty={casoClient.dificultad.toString()}
        stepCount={casoClient.pasos.length}
        caseId={casoClient.id}
      />
      <BreadcrumbStructuredData
        items={[
          { name: 'Inicio', url: '/' },
          { name: 'Casos Clínicos', url: '/casos' },
          { name: areaMap[casoClient.area || 'general'] || casoClient.area || 'General', url: `/casos?area=${casoClient.area}` },
          { name: casoClient.titulo, url: `/casos/${casoClient.id}` },
        ]}
      />
      
      <main className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-8">
        <CaseAccessGuard caseId={casoClient.id}>
          <CasoInteractiveUI casoClient={casoClient} />
        </CaseAccessGuard>
      </main>
    </div>
  );
}
