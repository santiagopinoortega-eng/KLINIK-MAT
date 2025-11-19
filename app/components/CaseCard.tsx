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

  const diffLabel = (n: number | null | undefined) => {
    if (!n) return 'Fácil';
    if (n === 1) return 'Fácil';
    if (n === 2) return 'Medio';
    if (n === 3) return 'Difícil';
    return String(n);
  };

  return (
    <article className="card group relative overflow-hidden transition-all hover:shadow-km-lg">
      {/* Badges superiores con nueva paleta */}
      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <span className="chip" style={{ background: 'rgba(13,148,136,0.12)', color: 'var(--km-teal)', border: '1px solid rgba(13,148,136,0.2)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          </svg>
          {area ? String(area) : 'General'}
        </span>
        <span className={`chip ${difficulty ? `chip-diff-${difficulty}` : 'chip-diff-1'}`}>
          {diffLabel(difficulty)}
        </span>
        {fecha && (
          <span className="ml-auto text-xs text-km-text-500 font-medium">{fecha}</span>
        )}
      </div>

      {/* Título con gradiente en hover */}
      <h3 className="text-km-navy text-xl font-bold leading-snug group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-km-primary transition-all">
        {title}
      </h3>

      {summary && (
        <p className="mt-3 text-sm text-km-text-700 leading-relaxed line-clamp-3">
          {summary}
        </p>
      )}

      <Link href={`/casos/${id}`} className="mt-6 btn btn-primary w-full transition-all hover:scale-105">
        Resolver caso →
      </Link>
    </article>
  );
}