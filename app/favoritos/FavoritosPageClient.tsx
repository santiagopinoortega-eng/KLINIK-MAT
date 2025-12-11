// app/favoritos/FavoritosPageClient.tsx
'use client';

import { useFavoritesContext } from '@/app/context/FavoritesContext';
import CaseCard from '@/app/components/CaseCard';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { ArrowLeftIcon, StarIcon } from '@heroicons/react/24/outline';

export default function FavoritosPageClient() {
  const { isSignedIn, isLoaded } = useUser();
  const { favorites, loading, error } = useFavoritesContext();

  // Loading state
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto max-w-6xl py-8 px-6">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse mb-3"></div>
            <div className="h-5 w-80 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Cards Skeleton */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-72 bg-gray-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <StarIcon className="h-20 w-20 mx-auto mb-6 text-yellow-500" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Inicia sesión para ver tus favoritos
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Guarda casos clínicos para repasarlos más tarde
          </p>
          <Link
            href="/sign-in"
            className="inline-block px-8 py-4 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto max-w-6xl py-8 px-6">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
            <p className="text-red-700 font-semibold text-lg mb-2">Error al cargar favoritos</p>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="container mx-auto max-w-6xl py-8 px-6">
        {/* Back button */}
        <div className="mb-6">
          <Link 
            href="/casos"
            className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-semibold transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Volver a Casos Clínicos</span>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <StarIcon className="h-10 w-10 text-yellow-500" />
            <h1 className="text-4xl font-bold text-gray-800">
              Mis Favoritos
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            {favorites.length === 0 
              ? 'Aún no tienes casos favoritos. ¡Comienza a guardar casos para repasarlos más tarde!'
              : `${favorites.length} ${favorites.length === 1 ? 'caso guardado' : 'casos guardados'} para repasar cuando quieras`
            }
          </p>
        </div>

        {/* Empty state */}
        {favorites.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <StarIcon className="h-16 sm:h-20 w-16 sm:w-20 mx-auto mb-4 text-neutral-300" />
            <h3 className="text-lg sm:text-xl font-semibold text-km-navy mb-2">
              No tienes casos favoritos aún
            </h3>
            <p className="text-sm sm:text-base text-neutral-600 mb-6 max-w-md mx-auto">
              Explora los casos clínicos y haz clic en la estrella ⭐ para guardarlos aquí
            </p>
            <Link
              href="/casos"
              className="btn btn-primary inline-block"
            >
              Explorar casos clínicos
            </Link>
          </div>
        ) : (
          <>
            {/* Stats Card */}
            <div className="mb-6 p-4 sm:p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200 shadow-sm">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-1">
                    {favorites.length}
                  </div>
                  <div className="text-xs sm:text-sm text-km-navy-600 font-medium">
                    Casos guardados
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-1">
                    {new Set(favorites.map(f => f.case.area)).size}
                  </div>
                  <div className="text-xs sm:text-sm text-km-navy-600 font-medium">
                    Áreas diferentes
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
                    {favorites.filter(f => f.case.difficulty === 1).length}
                  </div>
                  <div className="text-xs sm:text-sm text-km-navy-600 font-medium">
                    Dificultad baja
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-1">
                    {favorites.filter(f => f.case.difficulty === 3).length}
                  </div>
                  <div className="text-xs sm:text-sm text-km-navy-600 font-medium">
                    Dificultad alta
                  </div>
                </div>
              </div>
            </div>

            {/* Cases Grid */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map(favorite => (
                <CaseCard
                  key={favorite.id}
                  id={favorite.case.id}
                  title={favorite.case.title}
                  area={favorite.case.area}
                  difficulty={favorite.case.difficulty}
                  summary={favorite.case.summary}
                  createdAt={favorite.case.createdAt}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
