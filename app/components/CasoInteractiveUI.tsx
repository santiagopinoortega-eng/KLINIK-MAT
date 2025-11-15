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
      <div className="grid md:grid-cols-[1fr_300px] gap-6 items-start">
        <div>
          <div className="bg-[var(--km-surface-1)] rounded-[var(--km-radius)] p-4 md:p-6 shadow-card border">
            <CasoDetalleClient />
          </div>
        </div>

        <aside>
          <CaseNavigator />
        </aside>
      </div>
    </CasoProvider>
  );
}
