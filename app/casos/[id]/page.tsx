// app/casos/[id]/page.tsx
import { prismaRO } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { CasoClient, Paso, McqOpcion } from "@/lib/types";
import dynamic from "next/dynamic";

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

  return (
    <div className="min-h-screen bg-[var(--km-surface-2)]">
      <main className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-8">
        <CasoInteractiveUI casoClient={casoClient} />
      </main>
    </div>
  );
}
