// app/sitemap.ts
import { prismaRO } from '@/lib/prisma';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://klinik-mat.vercel.app';
  
  // Obtener todos los casos con su fecha de actualización
  const cases = await prismaRO.case.findMany({ 
    where: { isPublic: true },
    select: { 
      id: true, 
      updatedAt: true,
      area: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Agrupar por área para las páginas de categorías
  const areas = ['ginecologia', 'obstetricia', 'neonatologia', 'ssr'];

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/casos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/areas`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/recursos`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/recursos/anticonceptivos`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/recursos/minsal`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Páginas de categorías por área
  const areaPages: MetadataRoute.Sitemap = areas.map(area => ({
    url: `${baseUrl}/casos?area=${area}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Páginas individuales de casos
  const casePages: MetadataRoute.Sitemap = cases.map(caso => ({
    url: `${baseUrl}/casos/${caso.id}`,
    lastModified: caso.updatedAt || new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...areaPages, ...casePages];
}