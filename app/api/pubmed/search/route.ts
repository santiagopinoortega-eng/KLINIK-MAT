// app/api/pubmed/search/route.ts
/**
 * API para búsqueda de artículos en PubMed
 * Arquitectura: DTOs + Middleware composable + Error handling
 */

import { NextResponse } from 'next/server';
import { compose, withAuth, withRateLimit, withLogging, withValidation } from '@/lib/middleware/api-middleware';
import { RATE_LIMITS } from '@/lib/ratelimit';
import { PubMedSearchDto } from '@/lib/dtos/subscription.dto';
import type { PubMedArticleSummary, PubMedArticle, PubMedAuthor, PubMedArticleId } from '@/lib/types/api-types';

const PUBMED_API_KEY = process.env.PUBMED_API_KEY || '';
const PUBMED_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

/**
 * POST /api/pubmed/search
 * Buscar artículos en PubMed
 * 
 * @middleware withAuth - Requiere autenticación
 * @middleware withRateLimit - Protección contra spam
 * @middleware withValidation - Valida body con PubMedSearchDto
 * @middleware withLogging - Log de requests/responses
 */
export const POST = compose(
  withAuth,
  withRateLimit(RATE_LIMITS.AUTHENTICATED),
  withValidation(PubMedSearchDto),
  withLogging
)(async (req, context) => {
  const { query, maxResults, filters } = context.body;

  // 1. Construir query con filtros
  let searchQuery = query;
  
  if (filters?.yearFrom || filters?.yearTo) {
    const yearFrom = filters.yearFrom || 1900;
    const yearTo = filters.yearTo || new Date().getFullYear();
    searchQuery += ` AND ${yearFrom}:${yearTo}[pdat]`;
  }
  
  if (filters?.articleType) {
    searchQuery += ` AND ${filters.articleType}[pt]`;
  }

  // 2. Búsqueda de IDs (ESearch)
  const apiKeyParam = PUBMED_API_KEY ? `&api_key=${PUBMED_API_KEY}` : '';
  const searchUrl = `${PUBMED_BASE_URL}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchQuery)}&retmax=${maxResults}&retmode=json${apiKeyParam}`;
  
  const searchResponse = await fetch(searchUrl);
  if (!searchResponse.ok) {
    throw new Error(`PubMed API error: ${searchResponse.status}`);
  }
  
  const searchData = await searchResponse.json();
  
  const pmids = searchData.esearchresult?.idlist || [];
  const total = parseInt(searchData.esearchresult?.count || '0');

  if (pmids.length === 0) {
    return NextResponse.json({ 
      success: true,
      articles: [], 
      total: 0, 
      query 
    });
  }

  // 3. Obtener detalles de artículos (ESummary)
  const summaryUrl = `${PUBMED_BASE_URL}/esummary.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=json${apiKeyParam}`;
  
  const summaryResponse = await fetch(summaryUrl);
  if (!summaryResponse.ok) {
    throw new Error(`PubMed API error: ${summaryResponse.status}`);
  }
  
  const summaryData = await summaryResponse.json();

  // 4. Procesar resultados
  const articles = pmids.map((pmid: string) => {
    const article = summaryData.result[pmid];
    const articleData = article as PubMedArticleSummary;
    
    return {
      pmid,
      title: articleData.title || 'Sin título',
      authors: articleData.authors?.slice(0, 3).map((a: PubMedAuthor) => a.name) || [],
      journal: articleData.fulljournalname || articleData.source || 'Desconocido',
      pubDate: articleData.pubdate || articleData.epubdate || 'Fecha desconocida',
      doi: articleData.elocationid?.split(' ')[0] || '',
      pmc: articleData.articleids?.find((id: PubMedArticleId) => id.idtype === 'pmc')?.value || '',
      url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
    } as PubMedArticle;
  });

  return NextResponse.json({
    success: true,
    articles,
    total,
    query,
  });
});
