// components/CaseProgress.tsx
"use client";

interface Props {
  current: number;
  total: number;
}

export default function CaseProgress({ current, total }: Props) {
  const progressPercentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-neutral-600">
          Paso {current} de {total}
        </span>
        <span className="text-sm font-bold text-brand-600">
          {Math.round(progressPercentage)}%
        </span>
      </div>
      <div className="w-full bg-neutral-200 rounded-full h-2.5">
        <div
          className="bg-brand-500 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
}
