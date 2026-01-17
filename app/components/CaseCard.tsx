// app/components/CaseCard.tsx
'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import FavoriteButton from './FavoriteButton';
import { useEngagement } from '@/lib/useEngagement';

type Props = {
  id: string;
  title: string;
  area: string | null;
  difficulty: number | null;
  summary?: string | null;
  createdAt?: string;
  // Engagement tracking (opcional)
  engagementSource?: 'recommendation' | 'search' | 'browse' | 'trending' | 'challenge';
  recommendationGroup?: 'specialty' | 'review' | 'challenge' | 'trending';
};

export default function CaseCard({
  id, 
  title, 
  area, 
  difficulty, 
  summary, 
  createdAt,
  engagementSource,
  recommendationGroup,
}: Props) {
  const { trackRecommendationClick } = useEngagement();

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
      className="group relative overflow-hidden flex flex-col bg-gradient-to-br from-red-50 via-white to-rose-50 rounded-xl border-2 border-red-100 hover:border-red-400 transition-all duration-200 hover:shadow-xl hover:shadow-red-100/50"
      style={{
        minHeight: '220px',
        maxHeight: '280px',
      }}
    >
      {/* Botón de favoritos - Posición absoluta arriba a la derecha */}
      <div className="absolute top-3 right-3 z-10">
        <FavoriteButton caseId={id} size="sm" />
      </div>

      {/* Contenido con padding */}
      <div className="p-5 flex flex-col h-full">
        {/* Badges superiores */}
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs px-3 py-1 rounded-full font-medium bg-teal-50 text-teal-700 border border-teal-200">
            {area ? String(area) : 'General'}
          </span>
          <span 
            className="text-xs px-3 py-1 rounded-full font-bold"
            style={{
              background: colors.badgeBg,
              color: colors.badgeColor,
              border: colors.badgeBorder
            }}
          >
            {diffLabel(difficulty)}
          </span>
        </div>

        {/* Título con color rojo */}
        <h3 className="text-lg font-bold leading-tight mb-2 text-red-800 group-hover:text-red-600 transition-colors">
          {title}
        </h3>

        {/* Resumen con altura fija */}
        <div className="flex-1 overflow-hidden mb-4">
          {summary && (
            <p className="text-sm leading-relaxed text-gray-700 line-clamp-3">
              {summary}
            </p>
          )}
        </div>

        {/* Botón simple */}
        <Link 
          href={`/casos/${id}`} 
          className="mt-auto inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 transition-all text-sm"
          onClick={() => {
            if (engagementSource === 'recommendation' && recommendationGroup) {
              trackRecommendationClick(id, recommendationGroup);
            }
          }}
        >
          <span>Resolver caso</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </article>
  );
}