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
  if (!casoDesdeDB || typeof casoDesdeDB.contenido !== 'object' || casoDesdeDB.contenido === null) {
    return null;
  }

  const contenido = casoDesdeDB.contenido as any;
  const pasosNormalizados: Paso[] = (contenido.pasos || []).map(
    (paso: any, index: number): Paso => {
      if (paso.tipo === 'mcq') {
        const opciones: McqOpcion[] = (paso.opciones || []).map(
          (opt: any, optIndex: number) => ({
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
        // Asumimos 'short' si no es 'mcq'
        return {
          id: paso.id || `paso-${index}`,
          tipo: 'short',
          enunciado: paso.enunciado || '',
          guia: paso.guia,
          feedbackDocente: paso.feedbackDocente,
        };
      }
    }
  );

  return {
    id: casoDesdeDB.id,
    titulo: casoDesdeDB.titulo,
    area: casoDesdeDB.area,
    dificultad: casoDesdeDB.dificultad,
    vigneta: contenido.vigneta || null,
    pasos: pasosNormalizados,
    referencias: contenido.referencias || [],
    debrief: contenido.debrief || null,
  };
}

export default async function CasoPage({ params }: PageProps) {
  const casoDesdeDB = await prismaRO.case.findUnique({
    where: { id: params.id },
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
    <main className="container-app py-8">
      <CasoInteractiveUI casoClient={casoClient} />
    </main>
  );
}
