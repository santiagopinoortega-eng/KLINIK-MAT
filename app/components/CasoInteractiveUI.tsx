// app/components/CasoInteractiveUI.tsx
"use client";

import type { CasoClient } from "@/lib/types";
import { CasoProvider, useCaso } from "./CasoContext";
import CaseNavigator from "./CaseNavigator";
import CaseTimer from "./CaseTimer";
import CaseModeSelector from "./CaseModeSelector";
import dynamic from 'next/dynamic';

// Dynamic imports para code splitting
const CasoDetalleClient = dynamic(() => import('./CasoDetalleClient'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <div className="text-neutral-500 animate-pulse">Cargando caso...</div>
    </div>
  ),
});

const VignetteHeader = dynamic(() => import('./VignetteHeader'), { ssr: false });

interface Props {
  casoClient: CasoClient;
}

// Componente interno que usa el contexto
function CasoContent() {
  const { mode, timeLimit, autoSubmitCase, setMode, isCaseCompleted, caso } = useCaso();

  // Si no hay modo seleccionado, mostrar selector
  if (!mode) {
    return <CaseModeSelector onModeSelected={setMode} caseTitle={caso.titulo} />;
  }

  return (
    <>
      {/* Timer (solo si hay límite de tiempo) */}
      {timeLimit && timeLimit > 0 && (
        <CaseTimer 
          duration={timeLimit}
          onExpire={autoSubmitCase}
          warningAt={120}
          isCaseCompleted={isCaseCompleted}
        />
      )}

      {/* Viñeta horizontal en la parte superior */}
      <VignetteHeader title={caso.titulo} vigneta={caso.vigneta} />

      {/* Grid: preguntas a la izquierda (mayor espacio horizontal), navigator a la derecha (compacto) */}
      <div className="grid lg:grid-cols-[1fr_280px] gap-6 items-start">
        <div className="w-full">
          <div className="bg-gradient-to-br from-white via-red-50/30 to-orange-50/20 rounded-[var(--km-radius-lg)] p-5 md:p-8 shadow-km-md border-2 border-red-100/50">
            <CasoDetalleClient />
          </div>
        </div>

        <aside className="lg:sticky lg:top-24">
          <CaseNavigator />
        </aside>
      </div>
    </>
  );
}

export default function CasoInteractiveUI({ casoClient }: Props) {
  return (
    <CasoProvider caso={casoClient}>
      <CasoContent />
    </CasoProvider>
  );
}
