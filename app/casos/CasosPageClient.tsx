'use client';

import { CasoListItem } from '@/services/caso.service';
import { useMemo, useState } from 'react';
import CaseCard from '@/app/components/CaseCard';
import Badge from '@/app/components/ui/Badge';

export default function CasosPageClient({ data }: { data: CasoListItem[] }) {

  const [q, setQ] = useState('');
  const [area, setArea] = useState('all');
  const [difficulty, setDifficulty] = useState('all');

  const areas = useMemo(() => ['all', ...Array.from(new Set(data.map(d => d.area).filter((a): a is string => !!a)))], [data]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return data.filter(d =>
      (area === 'all' || d.area === area) && // Filter by area
      (difficulty === 'all' || String(d.difficulty) === difficulty) &&
      (!s || d.title.toLowerCase().includes(s) || (d.summary ?? '').toLowerCase().includes(s))
    );
  }, [data, q, area, difficulty]);

  return (
    <div className="container py-8">
      <div className="mb-4">
        <div className="filters-bar">
          <input
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            placeholder="Buscar por título o resumen…"
            className="w-full sm:w-72 rounded-lg px-3 py-2 text-sm outline-none transition"
            aria-label="Buscar casos"
          />
          <select
            value={area}
            onChange={(e)=>setArea(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm outline-none transition"
            aria-label="Filtrar por área"
          >
            {areas.map(a => <option key={a} value={a}>{a === 'all' ? 'Todas las áreas' : a}</option>)}
          </select>

          <select
            value={difficulty}
            onChange={(e)=>setDifficulty(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm outline-none transition"
            aria-label="Filtrar por dificultad"
          >
            <option value="all">Todas las dificultades</option>
            <option value="1">Fácil</option>
            <option value="2">Medio</option>
            <option value="3">Difícil</option>
          </select>

          <div className="ml-auto text-xs text-[var(--km-text-700)]"><Badge>{filtered.length}</Badge> {filtered.length === 1 ? 'resultado' : 'resultados'}</div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded border border-amber-200 bg-amber-50 p-3 text-amber-800 text-sm">
          No hay resultados para <b>{q || '(vacío)'}</b>.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(c => (
            <CaseCard key={c.id} {...c} />
          ))}
        </div>
      )}
    </div>
  );
}