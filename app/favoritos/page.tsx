// app/favoritos/page.tsx
import { Metadata } from 'next';
import FavoritosPageClient from './FavoritosPageClient';

export const metadata: Metadata = {
  title: 'Mis Favoritos — KLINIK-MAT',
  description: 'Casos clínicos guardados para repasar más tarde',
};

export default function FavoritosPage() {
  return <FavoritosPageClient />;
}
