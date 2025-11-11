// app/api/cases/route.ts
import { prismaRO } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const data = await prismaRO.case.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, titulo: true, area: true, dificultad: true, createdAt: true },
      take: 200,
    });

    return new Response(JSON.stringify({ ok: true, data }), {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
      },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }
}