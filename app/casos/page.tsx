import { getCasosActivos } from '@/services/caso.service';
import { prismaRO } from '@/lib/prisma';
import CasosPageClient from './CasosPageClient';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

interface CasosPageProps {
  searchParams: { area?: string };
}

export default async function CasosPage({ searchParams }: CasosPageProps) {
  const selectedArea = searchParams.area;
  
  // Usamos el servicio centralizado para obtener los datos.
  const data = await getCasosActivos();

  return <CasosPageClient data={data} selectedArea={selectedArea} />;
}