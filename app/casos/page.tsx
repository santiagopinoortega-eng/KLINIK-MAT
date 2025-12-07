import { getCasosActivos } from '@/services/caso.service';
import { prismaRO } from '@/lib/prisma';
import CasosPageClient from './CasosPageClient';

// ISR: Regenerar cada 1 hora (casos no cambian frecuentemente)
export const revalidate = 3600;

interface CasosPageProps {
  searchParams: { area?: string };
}

export default async function CasosPage({ searchParams }: CasosPageProps) {
  const selectedArea = searchParams.area;
  
  // Usamos el servicio centralizado para obtener los datos.
  const data = await getCasosActivos();

  return <CasosPageClient data={data} selectedArea={selectedArea} />;
}