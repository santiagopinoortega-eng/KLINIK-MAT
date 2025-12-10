// app/context/FavoritesContext.tsx
'use client';

import React, { createContext, useContext } from 'react';
import { useFavorites } from '@/app/hooks/useFavorites';

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

interface FavoritesContextType {
  favorites: Favorite[];
  loading: boolean;
  error: string | null;
  isFavorite: (caseId: string) => boolean;
  addFavorite: (caseId: string) => Promise<{success: boolean; error?: string}>;
  removeFavorite: (caseId: string) => Promise<{success: boolean; error?: string}>;
  toggleFavorite: (caseId: string) => Promise<{success: boolean; error?: string}>;
  refetch: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const favoritesData = useFavorites();

  return (
    <FavoritesContext.Provider value={favoritesData}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavoritesContext() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavoritesContext must be used within a FavoritesProvider');
  }
  return context;
}
