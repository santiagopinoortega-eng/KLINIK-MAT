import { NextRequest, NextResponse } from 'next/server';

const PUBMED_API_KEY = process.env.PUBMED_API_KEY || '';
const PUBMED_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

export async function POST(request: NextRequest) {
  try {
    const { query, maxResults = 15, filters } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

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
    if (!searchResponse.ok) {
      throw new Error(`PubMed API error: ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    
    const pmids = searchData.esearchresult?.idlist || [];
    const total = parseInt(searchData.esearchresult?.count || '0');

    if (pmids.length === 0) {
      return NextResponse.json({ 
        articles: [], 
        total: 0, 
        query 
      });
    }

    // 3. Obtener detalles de artículos (ESummary)
    const summaryUrl = `${PUBMED_BASE_URL}/esummary.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=json&api_key=${PUBMED_API_KEY}`;
    
    const summaryResponse = await fetch(summaryUrl);
    if (!summaryResponse.ok) {
      throw new Error(`PubMed API error: ${summaryResponse.status}`);
    }
    
    const summaryData = await summaryResponse.json();

    // 4. Procesar resultados
    const articles = pmids.map((pmid: string) => {
      const article = summaryData.result[pmid];
      
      return {
        pmid,
        title: article.title || 'Sin título',
        authors: article.authors?.slice(0, 3).map((a: any) => a.name) || [],
        journal: article.fulljournalname || article.source || 'Desconocido',
        pubDate: article.pubdate || article.epubdate || 'Fecha desconocida',
        doi: article.elocationid?.split(' ')[0] || '',
        pmc: article.articleids?.find((id: any) => id.idtype === 'pmc')?.value || '',
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      };
    });

    return NextResponse.json({
      articles,
      total,
      query,
    });

  } catch (error: any) {
    console.error('Error in PubMed API:', error);
    return NextResponse.json(
      { error: error.message || 'Error al buscar en PubMed' },
      { status: 500 }
    );
  }
}
