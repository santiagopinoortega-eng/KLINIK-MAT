import { prismaRO } from '@/lib/prisma';
import CasosPageClient from './CasosPageClient';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function CasosPage() {
  const data = await prismaRO.case.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: 'desc' },
    select: { id:true, titulo:true, area:true, dificultad:true, resumen:true },
  });

  return <CasosPageClient data={data} />;
}