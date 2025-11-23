// components/CaseProgress.tsx
// Actualizado: v3.0.0 - Paleta triádica Clinical Excellence
"use client";

interface Props {
  current: number;
  total: number;
}

export default function CaseProgress({ current, total }: Props) {
  const progressPercentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full mb-8">
      {/* Header con Pregunta X de Y */}
      <div className="flex justify-between items-center mb-3">
        <span 
          className="text-sm font-semibold text-[#1E3A5F]" 
          style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
        >
          Pregunta {current} de {total}
        </span>
        <span className="text-sm font-bold text-white bg-gradient-to-r from-[#DC2626] to-[#F87171] px-3 py-1.5 rounded-full shadow-md">
          {Math.round(progressPercentage)}%
        </span>
      </div>
      
      {/* Barra de progreso */}
      <div className="w-full bg-gradient-to-r from-neutral-100 to-neutral-200 rounded-full h-4 shadow-inner border border-neutral-200">
        <div
          className="bg-gradient-to-r from-[#DC2626] via-[#F87171] to-[#FCA5A5] h-4 rounded-full transition-all duration-500 shadow-lg relative overflow-hidden"
          style={{ width: `${progressPercentage}%` }}
        >
          <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
}
