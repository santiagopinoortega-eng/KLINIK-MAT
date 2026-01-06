/**
 * PubMed API Integration
 * Utiliza E-utilities de NCBI para búsquedas de literatura médica
 * 
 * 🔥 OPTIMIZACIÓN: Circuit breaker para prevenir rate limit bans
 * - Límite: 10 req/s con API key (dejamos margen a 8 req/s)
 * - Si se excede, devuelve error en vez de llamar a PubMed
 * - Se resetea cada minuto automáticamente
 */

import { logger } from './logger';

const PUBMED_API_KEY = process.env.PUBMED_API_KEY || '';
const PUBMED_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

// 🔥 Circuit Breaker: Control de rate limiting
const circuitBreaker = {
  callsThisMinute: 0,
  maxCallsPerMinute: 8, // Límite seguro (PubMed permite 10 con API key)
  lastResetTime: Date.now(),
  
  canMakeRequest(): boolean {
    // Reset contador cada minuto
    if (Date.now() - this.lastResetTime > 60_000) {
      this.callsThisMinute = 0;
      this.lastResetTime = Date.now();
    }
    
    return this.callsThisMinute < this.maxCallsPerMinute;
  },
  
  recordRequest(): void {
    this.callsThisMinute++;
  },
  
  getWaitTime(): number {
    return Math.ceil((60_000 - (Date.now() - this.lastResetTime)) / 1000);
  },
};

export interface PubMedArticle {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  pubDate: string;
  abstract?: string;
  doi?: string;
  pmc?: string;
  url: string;
}

export interface PubMedSearchResult {
  articles: PubMedArticle[];
  total: number;
  query: string;
}

/**
 * Busca artículos en PubMed (client-side)
 * Llama a nuestra API route para evitar problemas de CORS
 */
export async function searchPubMed(
  query: string,
  maxResults: number = 10,
  filters?: {
    yearFrom?: number;
    yearTo?: number;
    articleType?: string;
  }
): Promise<PubMedSearchResult> {
  try {
    // 🔥 Circuit Breaker: Verificar rate limit antes de llamar
    if (!circuitBreaker.canMakeRequest()) {
      throw new Error(
        `PubMed rate limit alcanzado. Intenta en ${circuitBreaker.getWaitTime()}s.`
      );
    }
    
    circuitBreaker.recordRequest();
    
    // Llamar a nuestra API route en lugar de directamente a PubMed
    const response = await fetch('/api/pubmed/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        maxResults,
        filters,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al buscar en PubMed');
    }

    const data = await response.json();
    
    return {
      articles: data.articles || [],
      total: data.total || 0,
      query: data.query || query,
    };
  } catch (error: any) {
    logger.error('PubMed search failed', error, { query, maxResults });
    throw new Error(error.message || 'Error de conexión con PubMed');
  }
}

/**
 * Obtiene el abstract de un artículo específico
 */
export async function getArticleAbstract(pmid: string): Promise<string> {
  try {
    const url = `${PUBMED_BASE_URL}/efetch.fcgi?db=pubmed&id=${pmid}&retmode=xml&rettype=abstract&api_key=${PUBMED_API_KEY}`;
    
    const response = await fetch(url);
    const xmlText = await response.text();
    
    // Parsear XML para extraer abstract
    const abstractMatch = xmlText.match(/<AbstractText[^>]*>(.*?)<\/AbstractText>/s);
    
    if (abstractMatch && abstractMatch[1]) {
      return abstractMatch[1].replace(/<[^>]+>/g, ''); // Eliminar tags HTML
    }
    
    return 'Abstract no disponible';
  } catch (error) {
    logger.error('Failed to fetch PubMed abstract', error, { pmid });
    return 'Error al cargar abstract';
  }
}

/**
 * Búsquedas predefinidas para obstetricia
 */
export const PRESET_SEARCHES = [
  {
    name: 'Preeclampsia',
    query: 'preeclampsia AND (management OR treatment OR diagnosis)',
    icon: '🩺',
  },
  {
    name: 'Diabetes Gestacional',
    query: 'gestational diabetes AND (screening OR management)',
    icon: '🩸',
  },
  {
    name: 'Hemorragia Postparto',
    query: 'postpartum hemorrhage AND (prevention OR management)',
    icon: '🚨',
  },
  {
    name: 'Parto Prematuro',
    query: 'preterm labor AND (prevention OR tocolysis)',
    icon: '👶',
  },
  {
    name: 'RCIU',
    query: 'intrauterine growth restriction OR IUGR OR FGR',
    icon: '📊',
  },
  {
    name: 'Ecografía Obstétrica',
    query: 'obstetric ultrasound AND (first trimester OR second trimester)',
    icon: '🔬',
  },
];
