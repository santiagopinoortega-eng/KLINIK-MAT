// app/hooks/useFavorites.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

interface CaseInfo {
  id: string;
  title: string;
  area: string;
  difficulty: number;
  summary: string | null;
  createdAt: string;
}

interface Favorite {
  id: string;
  caseId: string;
  createdAt: string;
  case: CaseInfo;
}

export function useFavorites() {
  const { isSignedIn } = useUser();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar favoritos al montar el componente
  const fetchFavorites = useCallback(async () => {
    if (!isSignedIn) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/favorites');
      
      if (!response.ok) {
        throw new Error('Error al cargar favoritos');
      }

      const data = await response.json();
      setFavorites(data.favorites || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Verificar si un caso está en favoritos
  const isFavorite = useCallback((caseId: string): boolean => {
    return favorites.some(f => f.caseId === caseId);
  }, [favorites]);

  // Agregar a favoritos
  const addFavorite = useCallback(async (caseId: string) => {
    if (!isSignedIn) {
      return { success: false, error: 'Debes iniciar sesión' };
    }

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ caseId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al agregar favorito');
      }

      const data = await response.json();
      setFavorites(prev => [data.favorite, ...prev]);
      return { success: true };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error adding favorite:', err);
      return { success: false, error };
    }
  }, [isSignedIn]);

  // Eliminar de favoritos
  const removeFavorite = useCallback(async (caseId: string) => {
    if (!isSignedIn) {
      return { success: false, error: 'Debes iniciar sesión' };
    }

    try {
      const response = await fetch(`/api/favorites?caseId=${caseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al eliminar favorito');
      }

      setFavorites(prev => prev.filter(f => f.caseId !== caseId));
      return { success: true };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error removing favorite:', err);
      return { success: false, error };
    }
  }, [isSignedIn]);

  // Toggle favorito (agregar o eliminar)
  const toggleFavorite = useCallback(async (caseId: string) => {
    if (isFavorite(caseId)) {
      return await removeFavorite(caseId);
    } else {
      return await addFavorite(caseId);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  return {
    favorites,
    loading,
    error,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    refetch: fetchFavorites,
  };
}
