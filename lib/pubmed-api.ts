/**
 * PubMed API Integration
 * Utiliza E-utilities de NCBI para búsquedas de literatura médica
 */

const PUBMED_API_KEY = process.env.PUBMED_API_KEY || '';
const PUBMED_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

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
 * Busca artículos en PubMed
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
    const searchUrl = `${PUBMED_BASE_URL}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchQuery)}&retmax=${maxResults}&retmode=json&api_key=${PUBMED_API_KEY}`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    const pmids = searchData.esearchresult?.idlist || [];
    const total = parseInt(searchData.esearchresult?.count || '0');

    if (pmids.length === 0) {
      return { articles: [], total: 0, query };
    }

    // 3. Obtener detalles de artículos (ESummary)
    const summaryUrl = `${PUBMED_BASE_URL}/esummary.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=json&api_key=${PUBMED_API_KEY}`;
    
    const summaryResponse = await fetch(summaryUrl);
    const summaryData = await summaryResponse.json();

    // 4. Procesar resultados
    const articles: PubMedArticle[] = pmids.map((pmid: string) => {
      const article = summaryData.result[pmid];
      
      return {
        pmid,
        title: article.title || 'Sin título',
        authors: article.authors?.slice(0, 3).map((a: any) => a.name) || [],
        journal: article.fulljournalname || article.source || 'Desconocido',
        pubDate: article.pubdate || 'Fecha no disponible',
        doi: article.elocationid || undefined,
        pmc: article.articleids?.find((id: any) => id.idtype === 'pmc')?.value,
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      };
    });

    return { articles, total, query };

  } catch (error) {
    console.error('Error buscando en PubMed:', error);
    throw new Error('Error al buscar en PubMed. Por favor, intenta nuevamente.');
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
    console.error('Error obteniendo abstract:', error);
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
