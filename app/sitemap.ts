// app/sitemap.ts
import { prismaRO } from '@/lib/prisma';

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL!;
  const cases = await prismaRO.case.findMany({ select: { id: true, updatedAt: true } });

  return [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/recursos`, lastModified: new Date() },
    ...cases.map(c => ({
      url: `${base}/casos/${c.id}`,
      lastModified: c.updatedAt ?? new Date(),
    })),
  ];
}