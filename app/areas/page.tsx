// app/areas/page.tsx
import { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import AreasClient from './AreasClient';
import RecommendedCases from '@/app/components/RecommendedCases';

// ISR: Regenerar cada 24 horas (áreas son estáticas)
export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Elige tu Área de Estudio - KLINIK-MAT',
  description: 'Selecciona el área clínica que deseas practicar: Ginecología, SSR, Obstetricia o Neonatología',
};

export default async function AreasPage() {
  const { userId } = await auth();
  
  // Cargar todos los casos para recomendaciones
  let allCases: Array<{
    id: string;
    titulo: string;
    area: string;
    modulo?: string;
    dificultad: number;
    vigneta: null;
    pasos: never[];
    summary?: string | null;
  }> = [];
  if (userId) {
    try {
      const cases = await prisma.case.findMany({
        where: { isPublic: true },
        select: {
          id: true,
          title: true,
          area: true,
          modulo: true,
          difficulty: true,
          summary: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      allCases = cases.map(c => ({
        id: c.id,
        titulo: c.title,
        area: c.area,
        modulo: c.modulo || undefined,
        dificultad: c.difficulty,
        vigneta: null,
        pasos: [],
        summary: c.summary,
      }));
    } catch (error) {
      console.error('Error loading cases for recommendations:', error);
    }
  }

  return (
    <div className="space-y-8">
      {/* Recomendaciones personalizadas (solo para usuarios autenticados) */}
      {userId && allCases.length > 0 && (
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6">
          <RecommendedCases allCases={allCases} showOnboarding={true} />
        </div>
      )}

      {/* Selector de áreas original */}
      <AreasClient />
    </div>
  );
}
