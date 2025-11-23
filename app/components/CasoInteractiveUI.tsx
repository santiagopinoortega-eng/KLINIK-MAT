// app/components/CasoInteractiveUI.tsx
"use client";

import type { CasoClient } from "@/lib/types";
import { CasoProvider } from "./CasoContext";
import CasoDetalleClient from "./CasoDetalleClient";
import CaseNavigator from "./CaseNavigator";
import dynamic from 'next/dynamic';

// VignetteHeader is a client component (collapse + tags). Dynamically import to avoid SSR issues.
const VignetteHeader = dynamic(() => import('./VignetteHeader'), { ssr: false });

interface Props {
  casoClient: CasoClient;
}

export default function CasoInteractiveUI({ casoClient }: Props) {
  return (
    <CasoProvider caso={casoClient}>
      {/* Viñeta horizontal en la parte superior */}
      <VignetteHeader title={casoClient.titulo} vigneta={casoClient.vigneta} />

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
    </CasoProvider>
  );
}
