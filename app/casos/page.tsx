import { getCasosActivos } from '@/services/caso.service';
import { prismaRO } from '@/lib/prisma';
import CasosPageClient from './CasosPageClient';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function CasosPage() {
  // Usamos el servicio centralizado para obtener los datos.
  // Esto mantiene nuestro componente limpio y la lógica de datos encapsulada.
  const data = await getCasosActivos();

  return <CasosPageClient data={data} />;
}