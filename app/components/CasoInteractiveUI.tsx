// app/components/CasoInteractiveUI.tsx
"use client";

import type { CasoClient } from "@/lib/types";
import { CasoProvider } from "./CasoContext";
import CasoDetalleClient from "./CasoDetalleClient";
import CaseNavigator from "./CaseNavigator";

interface Props {
  casoClient: CasoClient;
}

export default function CasoInteractiveUI({ casoClient }: Props) {
  return (
    <CasoProvider caso={casoClient}>
      <div className="grid md:grid-cols-[280px_1fr] gap-8 items-start">
        <CaseNavigator />
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl border border-white/80 shadow-soft p-6 md:p-8">
          <CasoDetalleClient />
        </div>
      </div>
    </CasoProvider>
  );
}
