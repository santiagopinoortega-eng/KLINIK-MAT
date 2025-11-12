'use client';

import { CasoListItem } from '@/services/caso.service';
import { useMemo, useState } from 'react';
import CaseCard from '@/app/components/CaseCard';
import Badge from '@/app/components/ui/Badge';

export default function CasosPageClient({ data }: { data: CasoListItem[] }) {

  const [q, setQ] = useState('');
  const [area, setArea] = useState('all');

  const areas = useMemo(() => ['all', ...Array.from(new Set(data.map(d => d.area).filter((a): a is string => !!a)))], [data]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return data.filter(d =>
      (area === 'all' || d.area === area) && // Filter by area

      (!s || d.title.toLowerCase().includes(s) || (d.summary ?? '').toLowerCase().includes(s))

      (!s || d.titulo.toLowerCase().includes(s) || (d.resumen ?? '').toLowerCase().includes(s))

    );
  }, [data, q, area]);

  return (
    <div className="container py-8">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          placeholder="Buscar por título o resumen…"
          className="w-full sm:w-72 rounded-lg border border-secondary-200/80 bg-white/50 px-3 py-2 text-sm outline-none
                     focus:ring-2 focus:ring-primary-400 focus:border-primary-300 transition"
        />
        <select
          value={area}
          onChange={(e)=>setArea(e.target.value)}
          className="rounded-lg border border-secondary-200/80 bg-white/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-300 transition"
        >
          {areas.map(a => <option key={a} value={a}>{a === 'all' ? 'Todas las áreas' : a}</option>)}
        </select>
        <div className="text-xs text-secondary-600"><Badge>{filtered.length}</Badge> {filtered.length === 1 ? 'resultado' : 'resultados'}</div>
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