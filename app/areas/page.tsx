// app/areas/page.tsx
import { Metadata } from 'next';
import AreasClient from './AreasClient';

// ISR: Regenerar cada 24 horas (áreas son estáticas)
export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Elige tu Área de Estudio - KLINIK-MAT',
  description: 'Selecciona el área clínica que deseas practicar: Ginecología, SSR, Obstetricia o Neonatología',
};

export default async function AreasPage() {
  return (
    <div>
      {/* Selector de áreas - Vista directa sin fricción */}
      <AreasClient />
    </div>
  );
}
