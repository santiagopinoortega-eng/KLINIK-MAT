// app/components/CaseCard.tsx
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Props = {
  id: string;
  title: string;
  area: string | null;
  difficulty: number | null;
  summary?: string | null;
  createdAt?: string;
};

export default function CaseCard({

  id, title, area, difficulty, summary, createdAt,

}: Props) {
  // Progreso local (no rompe si no existe)
  const [progress, setProgress] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('km-progress');
      if (!raw) return;
      const obj = JSON.parse(raw) ?? {};
      const data = obj?.[id];
      if (!data) return;

      // Acepta formas flexibles: { aciertos, total } o array de respuestas
      if (typeof data === 'object' && 'aciertos' in data && 'total' in data) {
        setProgress(Number(data.aciertos) || 0);
        setTotal(Number(data.total) || null);
      } else if (Array.isArray(data)) {
        const ok = data.filter((d: any) => d?.ok === true).length;
        setProgress(ok);
        setTotal(data.length);
      }
    } catch {
      /* silencio – no rompemos UI */
    }
  }, [id]);

  const fecha = useMemo(() => {
    if (!createdAt) return '';
    try {
      const d = new Date(createdAt);
      return d.toLocaleDateString();
    } catch { return ''; }
  }, [createdAt]);

  return (
    <article className="card group relative overflow-hidden bg-white/60 backdrop-blur-lg border border-white/80 shadow-soft transition-all hover:shadow-md hover:border-white">
      {/* Badges superiores */}
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex items-center rounded-md bg-primary-100/80 text-primary-800 px-2 py-0.5 text-xs font-medium">
          {area ? String(area) : 'General'}
        </span>
        <span className="inline-flex items-center rounded-md bg-secondary-200/70 text-secondary-800 px-2 py-0.5 text-xs font-medium">
          Dificultad {difficulty ?? 1}
        </span>
        {fecha && (
          <span className="ml-auto text-xs text-secondary-500">{fecha}</span>
        )}
      </div>

      {/* Título */}
      <h3 className="text-ink-800 text-lg font-semibold leading-snug group-hover:text-ink-900">
        {title}
      </h3>

      {summary && (
        <p className="mt-2 text-sm text-secondary-600 line-clamp-3">
          {summary}
        </p>
      )}

      <Link href={`/casos/${id}`} className="mt-6 btn btn-secondary w-full group-hover:bg-primary-500 group-hover:text-white group-hover:shadow-lg transition-all">
        Resolver caso →
      </Link>
    </article>
  );
}