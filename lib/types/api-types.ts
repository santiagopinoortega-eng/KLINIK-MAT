// lib/types/api-types.ts
/**
 * Tipos TypeScript para APIs y queries de Prisma
 * Elimina el uso de 'any' en queries y respuestas
 */

import { Prisma } from '@prisma/client';

// ============================================
// TIPOS PARA QUERIES DE CASOS
// ============================================

export interface CaseWhereClause {
  isPublic: boolean;
  area?: string;
  difficulty?: number;
  OR?: Array<{
    title?: { contains: string; mode: 'insensitive' };
    vignette?: { contains: string; mode: 'insensitive' };
    summary?: { contains: string; mode: 'insensitive' };
    questions?: {
      some: {
        text: { contains: string; mode: 'insensitive' };
      };
    };
  }>;
}

export type CaseListItem = {
  id: string;
  title: string;
  area: string;
  modulo: string | null;
  difficulty: number;
  summary: string | null;
  isPublic: boolean;
  createdAt: Date;
  _count: {
    questions: number;
  };
};

export interface CaseQueryResult {
  data: CaseListItem[];
  total: number;
}

// ============================================
// TIPOS PARA RESULTS
// ============================================

export interface CreateResultBody {
  caseId: string;
  answers: Array<{
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
    timeSpent?: number;
  }>;
  totalTimeSpent: number;
  score: number;
  percentage: number;
}

// ============================================
// TIPOS PARA PUBMED API
// ============================================

export interface PubMedAuthor {
  name: string;
}

export interface PubMedArticleId {
  idtype: string;
  value: string;
}

export interface PubMedArticleSummary {
  title: string;
  authors?: PubMedAuthor[];
  fulljournalname?: string;
  source?: string;
  pubdate?: string;
  epubdate?: string;
  elocationid?: string;
  articleids?: PubMedArticleId[];
}

export interface PubMedSearchFilters {
  yearFrom?: number;
  yearTo?: number;
}

export interface PubMedArticle {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  pubDate: string;
  doi: string;
  pmc: string;
  url: string;
}

// ============================================
// TIPOS PARA FAVORITOS
// ============================================

export interface FavoriteWithCase {
  id: string;
  caseId: string;
  userId: string;
  createdAt: Date;
  case: {
    id: string;
    title: string;
    area: string;
    difficulty: number;
    summary: string | null;
    createdAt: Date;
  };
}

export interface FavoriteResponse {
  id: string;
  caseId: string;
  createdAt: Date;
  case: {
    id: string;
    title: string;
    area: string;
    difficulty: number;
    summary: string | null;
    createdAt: Date;
  };
}

// ============================================
// TIPOS PARA CALCULADORAS
// ============================================

export interface ObstetricDataResult {
  fpp: string;
  edadGestacional: {
    semanas: number;
    dias: number;
  };
  trimestre: number;
}

export interface IMCResult {
  imc: number;
  categoria: string;
  clasificacion: string;
  recomendaciones: string;
}

export interface EcografiaResult {
  edadGestacional: {
    semanas: number;
    dias: number;
  };
  fpp: string;
}

// ============================================
// TIPOS PARA CATCH DE ERRORES
// ============================================

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export type ErrorWithMessage = Error & { message: string };

export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

export function getErrorMessage(error: unknown): string {
  if (isErrorWithMessage(error)) return error.message;
  if (typeof error === 'string') return error;
  return 'Error desconocido';
}
