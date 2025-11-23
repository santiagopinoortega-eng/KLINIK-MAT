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
    if (!n) return 'BAJA';
    if (n === 1) return 'BAJA';
    if (n === 2) return 'MEDIA';
    if (n === 3) return 'ALTA';
    return String(n);
  };

  const diffColors = (n: number | null | undefined) => {
    if (!n || n === 1) return {
      border: '3px solid #10B981',
      shadow: '0 4px 20px rgba(16, 185, 129, 0.25)',
      bg: 'rgba(16, 185, 129, 0.05)',
      badgeBg: 'rgba(16, 185, 129, 0.15)',
      badgeColor: '#059669',
      badgeBorder: '1px solid rgba(16, 185, 129, 0.3)'
    };
    if (n === 2) return {
      border: '3px solid #F59E0B',
      shadow: '0 4px 20px rgba(245, 158, 11, 0.25)',
      bg: 'rgba(245, 158, 11, 0.05)',
      badgeBg: 'rgba(245, 158, 11, 0.15)',
      badgeColor: '#D97706',
      badgeBorder: '1px solid rgba(245, 158, 11, 0.3)'
    };
    return {
      border: '3px solid #DC2626',
      shadow: '0 4px 20px rgba(220, 38, 38, 0.25)',
      bg: 'rgba(220, 38, 38, 0.05)',
      badgeBg: 'rgba(220, 38, 38, 0.15)',
      badgeColor: '#991B1B',
      badgeBorder: '1px solid rgba(220, 38, 38, 0.3)'
    };
  };

  const colors = diffColors(difficulty);

  return (
    <article 
      className="card group relative overflow-hidden flex flex-col"
      style={{
        border: colors.border,
        minHeight: '320px',
        maxHeight: '320px',
        background: `linear-gradient(to bottom, ${colors.bg}, var(--km-surface-1))`,
        boxShadow: colors.shadow
      }}
    >
      {/* Badges superiores */}
      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <span className="chip" style={{ 
          background: 'rgba(13,148,136,0.12)', 
          color: 'var(--km-teal)', 
          border: '1px solid rgba(13,148,136,0.2)' 
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          </svg>
          {area ? String(area) : 'General'}
        </span>
        <span className="chip font-bold" style={{
          background: colors.badgeBg,
          color: colors.badgeColor,
          border: colors.badgeBorder
        }}>
          {diffLabel(difficulty)}
        </span>
        {fecha && (
          <span className="ml-auto text-xs font-medium" style={{color: 'var(--km-text-500)'}}>{fecha}</span>
        )}
      </div>

      {/* Título con color rojo */}
      <h3 className="text-xl font-bold leading-snug mb-4" style={{color: 'var(--km-cardinal)'}}>
        {title}
      </h3>

      {/* Resumen con altura fija */}
      <div className="flex-1 overflow-hidden mb-5">
        {summary && (
          <p className="text-sm leading-relaxed line-clamp-3" style={{color: 'var(--km-text-700)'}}>
            {summary}
          </p>
        )}
      </div>

      {/* Botón siempre en la misma posición (al final) */}
      <Link href={`/casos/${id}`} className="mt-auto btn btn-primary w-full">
        Resolver caso →
      </Link>
    </article>
  );
}