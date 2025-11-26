// app/areas/page.tsx
import { Metadata } from 'next';
import AreasClient from './AreasClient';

export const metadata: Metadata = {
  title: 'Elige tu Área de Estudio - KLINIK-MAT',
  description: 'Selecciona el área clínica que deseas practicar: Ginecología, SSR, Obstetricia o Neonatología',
};

export default function AreasPage() {
  return <AreasClient />;
}
