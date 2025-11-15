"use client";

import { useState, useMemo } from 'react';
import cx from 'clsx';

export default function VignetteHeader({ title, vigneta }: { title: string; vigneta?: string | null }) {
  const [open, setOpen] = useState(true);

  const tags = useMemo(() => {
    if (!vigneta) return [] as string[];
    const text = vigneta.toLowerCase();
    const found = new Set<string>();

    // Keywords heuristics
    const keywordMap: [RegExp, string][] = [
      [/\b(semana|semanas|sem)\b\s*\d{1,2}/, 'Gestación'],
      [/preg(unta|nancy)|embarazo|gestante|gestación/, 'Embarazo'],
      [/fiebr|temperatura|t\s*[:=] ?\d{2}/, 'Fiebre'],
      [/sangrado|hemorragia|sangrante/, 'Sangrado'],
      [/dolor|dolor pélvico|dolor abdominal/, 'Dolor'],
      [/flujo|secreción|secrecion|moco/, 'Flujo'],
      [/anticoncep|DIU|implante|LNG|ACO|progestina/, 'Anticoncepción'],
      [/pareja|pareja(s)?/, 'Pareja'],
      [/mujer|varón|hombre|femenino|masculino/, 'Sexo'],
      [/htn|hipertens|pa\s*[:=]?\s*\d{2,3}\/\d{2,3}/, 'Tensión arterial'],
    ];

    for (const [re, label] of keywordMap) {
      if (re.test(text)) found.add(label);
    }

    // also pick short numeric patterns like '35 años' -> Edad
    if (/\b\d{2}\s*años\b/.test(text)) found.add('Edad');

    return Array.from(found).slice(0, 6);
  }, [vigneta]);

  return (
    <header className="mb-6">
      <div className="card p-4 md:p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6">
        <div className="flex-1">
          <h2 className="text-lg md:text-2xl font-extrabold" style={{ color: 'var(--km-deep)' }}>{title}</h2>
          {vigneta && (
            <div className="mt-3 text-[var(--km-text-700)] leading-relaxed max-w-prose whitespace-pre-wrap">{vigneta}</div>
          )}

          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((t) => (
                <span key={t} className="text-xs px-2 py-1 rounded-full border" style={{ background: 'rgba(255,182,166,0.12)', borderColor: 'rgba(200,106,85,0.12)', color: 'var(--km-deep)' }}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 flex items-start gap-3">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={cx('btn btn-secondary', open ? 'opacity-100' : 'opacity-90')}
            aria-expanded={open}
          >
            {open ? 'Ocultar viñeta' : 'Mostrar viñeta'}
          </button>
        </div>
      </div>
    </header>
  );
}
