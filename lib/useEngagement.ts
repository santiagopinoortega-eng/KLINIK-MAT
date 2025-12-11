// lib/useEngagement.ts
/**
 * Custom hook para tracking de métricas de engagement
 * Facilita el registro de interacciones desde componentes
 */

import { useCallback } from 'react';

type EngagementSource = 'recommendation' | 'search' | 'browse' | 'trending' | 'challenge';
type RecommendationGroup = 'specialty' | 'review' | 'challenge' | 'trending';
type EngagementAction = 'view' | 'click' | 'complete' | 'favorite';

type TrackEngagementParams = {
  caseId: string;
  source: EngagementSource;
  recommendationGroup?: RecommendationGroup;
  action: EngagementAction;
  sessionDuration?: number;
};

export function useEngagement() {
  const trackEngagement = useCallback(async (params: TrackEngagementParams) => {
    try {
      const response = await fetch('/api/engagement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        console.warn('Failed to track engagement:', await response.text());
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error tracking engagement:', error);
      return false;
    }
  }, []);

  /**
   * Track cuando un usuario hace clic en un caso recomendado
   */
  const trackRecommendationClick = useCallback(
    (caseId: string, group: RecommendationGroup) => {
      return trackEngagement({
        caseId,
        source: 'recommendation',
        recommendationGroup: group,
        action: 'click',
      });
    },
    [trackEngagement]
  );

  /**
   * Track cuando un usuario completa un caso
   */
  const trackCaseComplete = useCallback(
    (caseId: string, source: EngagementSource, sessionDuration?: number) => {
      return trackEngagement({
        caseId,
        source,
        action: 'complete',
        sessionDuration,
      });
    },
    [trackEngagement]
  );

  /**
   * Track cuando un usuario marca como favorito
   */
  const trackFavorite = useCallback(
    (caseId: string, source: EngagementSource) => {
      return trackEngagement({
        caseId,
        source,
        action: 'favorite',
      });
    },
    [trackEngagement]
  );

  return {
    trackEngagement,
    trackRecommendationClick,
    trackCaseComplete,
    trackFavorite,
  };
}
