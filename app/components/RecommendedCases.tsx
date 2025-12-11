// app/components/RecommendedCases.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { ChevronRight, TrendingUp, Target, RefreshCcw, Flame } from 'lucide-react';
import CaseCard from './CaseCard';
import SpecialtySelector from './SpecialtySelector';
import type { CasoClient } from '@/lib/types';
import type { 
  PersonalizedRecommendations, 
  StudentProgress 
} from '@/lib/recommendations';
import { 
  generatePersonalizedRecommendations,
  getSpecialtyStats 
} from '@/lib/recommendations';

type RecommendedCasesProps = {
  allCases: CasoClient[];
  showOnboarding?: boolean;
};

export default function RecommendedCases({ 
  allCases,
  showOnboarding = true 
}: RecommendedCasesProps) {
  const { user, isLoaded } = useUser();
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendations | null>(null);
  const [userProgress, setUserProgress] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSelector, setShowSelector] = useState(false);

  const userSpecialty = user?.unsafeMetadata?.specialty as string | undefined;

  // Cargar progreso del usuario
  useEffect(() => {
    const fetchProgress = async () => {
      if (!isLoaded || !user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/results');
        if (response.ok) {
          const data = await response.json();
          
          // Agrupar resultados por caso para obtener mejor score y contar intentos
          const resultsByCase = new Map<string, any[]>();
          data.results?.forEach((r: any) => {
            if (!resultsByCase.has(r.caseId)) {
              resultsByCase.set(r.caseId, []);
            }
            resultsByCase.get(r.caseId)!.push(r);
          });

          // Transformar a formato StudentProgress
          const progress: StudentProgress[] = Array.from(resultsByCase.entries()).map(([caseId, results]) => {
            const scores = results.map(r => (r.score / r.totalPoints) * 100);
            const bestScore = Math.max(...scores);
            return {
              caseId,
              bestScore,
              attempts: results.length,
              lastAttempt: new Date(results[0].completedAt),
              status: getStatusFromScore(bestScore),
            };
          });
          
          setUserProgress(progress);
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user, isLoaded]);

  // Generar recomendaciones cuando cambie el progreso o la especialidad
  useEffect(() => {
    if (!loading && isLoaded) {
      const recs = generatePersonalizedRecommendations(
        userSpecialty,
        allCases,
        userProgress
      );
      setRecommendations(recs);

      // Mostrar selector solo si el usuario no tiene especialidad guardada en su perfil
      // Si ya tiene especialidad guardada (aunque sea "Todas las áreas"), no mostrar
      if (!userSpecialty && showOnboarding) {
        setShowSelector(true);
      }
    }
  }, [userSpecialty, allCases, userProgress, loading, isLoaded, showOnboarding]);

  // Helper para determinar status desde score
  const getStatusFromScore = (score: number | null): 'not-attempted' | 'failed' | 'passed' | 'mastered' => {
    if (score === null) return 'not-attempted';
    if (score < 60) return 'failed';
    if (score < 90) return 'passed';
    return 'mastered';
  };

  // Handler para completar onboarding
  const handleOnboardingComplete = (specialty: string) => {
    setShowSelector(false);
    // Las recomendaciones se regenerarán automáticamente por el useEffect
    // La especialidad ya se guardó en el perfil de Clerk por el SpecialtySelector
  };

  const handleSkipOnboarding = () => {
    setShowSelector(false);
    // No guardar nada si el usuario omite, se le preguntará la próxima vez
  };

  // Mostrar onboarding si corresponde
  if (showSelector && showOnboarding) {
    return <SpecialtySelector onComplete={handleOnboardingComplete} onSkip={handleSkipOnboarding} showSkip />;
  }

  // Loading state
  if (loading || !isLoaded) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Si no hay especialidad y no mostramos onboarding, mostrar CTA
  if (!recommendations?.hasSpecialty && !showOnboarding) {
    return (
      <div className="card bg-gradient-km-primary text-white text-center p-8 sm:p-12">
        <div className="text-5xl mb-4">🎯</div>
        <h3 className="text-2xl font-bold mb-3">
          Personaliza tu experiencia
        </h3>
        <p className="text-white/90 mb-6 max-w-xl mx-auto">
          Selecciona tu área de interés para recibir recomendaciones
          personalizadas y casos específicos de tu especialidad.
        </p>
        <button
          onClick={() => setShowSelector(true)}
          className="btn btn-lg bg-white text-km-crimson hover:bg-km-blush hover:scale-105 shadow-km-xl transition-all"
        >
          Seleccionar mi área →
        </button>
      </div>
    );
  }

  if (!recommendations?.hasSpecialty) {
    return null;
  }

  // Estadísticas de la especialidad
  const stats = userSpecialty 
    ? getSpecialtyStats(userSpecialty, allCases, userProgress)
    : null;

  // Iconos por categoría
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'specialty': return <Target className="w-5 h-5" />;
      case 'review': return <RefreshCcw className="w-5 h-5" />;
      case 'challenge': return <TrendingUp className="w-5 h-5" />;
      case 'trending': return <Flame className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header con estadísticas */}
      {stats && (
        <div className="card bg-gradient-km-hero text-white p-6 sm:p-8 relative overflow-hidden">
          {/* Patrón de fondo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-5 right-5 w-32 h-32 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute bottom-5 left-5 w-24 h-24 rounded-full bg-white/15 blur-3xl" />
          </div>

          <div className="relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                  Tu progreso en {recommendations.specialty}
                </h2>
                <p className="text-white/90 text-sm sm:text-base">
                  {recommendations.totalRecommendations} casos recomendados para ti
                </p>
              </div>
              <button
                onClick={() => setShowSelector(true)}
                className="btn bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 text-sm"
              >
                Cambiar área
              </button>
            </div>

            {/* Barra de progreso */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Completitud</span>
                <span className="text-lg font-bold">{stats.completionPercentage}%</span>
              </div>
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${stats.completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="text-2xl font-bold">{stats.notAttempted}</div>
                <div className="text-xs text-white/80">Nuevos</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="text-2xl font-bold">{stats.failed}</div>
                <div className="text-xs text-white/80">Para repasar</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="text-2xl font-bold">{stats.passed}</div>
                <div className="text-xs text-white/80">Aprobados</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="text-2xl font-bold">{stats.mastered}</div>
                <div className="text-xs text-white/80">Dominados</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grupos de recomendaciones */}
      {recommendations.groups.map((group, idx) => (
        <section key={idx} className="space-y-4">
          {/* Header del grupo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-km-blush flex items-center justify-center text-xl">
                {group.icon}
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-km-cardinal">
                  {group.title}
                </h3>
                <p className="text-sm text-km-text-600">{group.description}</p>
              </div>
            </div>
            {/* Opcional: Link para ver todos */}
            {group.cases.length > 6 && (
              <Link
                href="/casos"
                className="hidden sm:flex items-center gap-1 text-sm text-km-crimson hover:text-km-cardinal font-medium transition-colors"
              >
                Ver todos
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Grid de casos */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {group.cases.slice(0, 6).map(caso => (
              <CaseCard 
                key={caso.id}
                id={caso.id}
                title={caso.titulo}
                area={caso.area || null}
                difficulty={typeof caso.dificultad === 'string' 
                  ? (caso.dificultad === 'Baja' ? 1 : caso.dificultad === 'Media' ? 2 : 3)
                  : caso.dificultad
                }
                summary={caso.summary}
                engagementSource="recommendation"
                recommendationGroup={group.category}
              />
            ))}
          </div>

          {/* Link móvil para ver todos */}
          {group.cases.length > 6 && (
            <div className="sm:hidden text-center">
              <Link
                href="/casos"
                className="inline-flex items-center gap-1 text-sm text-km-crimson hover:text-km-cardinal font-medium transition-colors"
              >
                Ver todos los casos de esta categoría
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </section>
      ))}

      {/* Empty state */}
      {recommendations.groups.length === 0 && (
        <div className="card text-center p-12">
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-km-navy mb-3">
            ¡Has completado todos los casos disponibles!
          </h3>
          <p className="text-km-text-600 mb-6">
            Excelente trabajo. Sigue practicando para dominar todos los casos.
          </p>
          <Link
            href="/casos"
            className="btn bg-km-crimson text-white hover:bg-km-cardinal"
          >
            Ver todos los casos
          </Link>
        </div>
      )}
    </div>
  );
}
