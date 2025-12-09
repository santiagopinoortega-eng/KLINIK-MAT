import { getCasosActivos } from '@/services/caso.service';
import { prismaRO } from '@/lib/prisma';
import CasosPageClient from './CasosPageClient';
import type { Metadata } from 'next';

// ISR: Regenerar cada 1 hora (casos no cambian frecuentemente)
export const revalidate = 3600;

// Metadata SEO optimizado
export const metadata: Metadata = {
  title: 'Casos Clínicos de Obstetricia',
  description: 'Biblioteca completa de casos clínicos interactivos: ITS, anticoncepción, embarazo, parto y neonatología. Practica con casos basados en protocolos MINSAL.',
  keywords: [
    'casos clínicos obstetricia',
    'casos ITS',
    'casos anticoncepción',
    'casos embarazo',
    'casos neonatología',
    'protocolos MINSAL',
  ],
  openGraph: {
    title: 'Casos Clínicos de Obstetricia | KLINIK-MAT',
    description: 'Practica con 50+ casos clínicos interactivos de obstetricia y neonatología',
    type: 'website',
  },
};

interface CasosPageProps {
  searchParams: { area?: string };
}

export default async function CasosPage({ searchParams }: CasosPageProps) {
  const selectedArea = searchParams.area;
  
  // Usamos el servicio centralizado para obtener los datos.
  const data = await getCasosActivos();

  return <CasosPageClient data={data} selectedArea={selectedArea} />;
}