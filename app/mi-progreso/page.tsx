// app/mi-progreso/page.tsx
import MiProgresoClient from './MiProgresoClient';

export const metadata = {
  title: 'Mi Progreso - KLINIK-MAT',
  description: 'Visualiza tu rendimiento y estadísticas de estudio',
};

export default function MiProgresoPage() {
  return <MiProgresoClient />;
}
