// app/components/FavoriteButton.tsx
'use client';

import { useState } from 'react';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { useFavorites } from '@/app/hooks/useFavorites';
import { useUser } from '@clerk/nextjs';

interface FavoriteButtonProps {
  caseId: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export default function FavoriteButton({ 
  caseId, 
  size = 'md',
  showLabel = false,
  className = ''
}: FavoriteButtonProps) {
  const { isSignedIn } = useUser();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const favorite = isFavorite(caseId);

  const sizeClasses = {
    sm: 'h-4 w-4 sm:h-5 sm:w-5',
    md: 'h-5 w-5 sm:h-6 sm:w-6',
    lg: 'h-6 w-6 sm:h-7 sm:w-7'
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      alert('Debes iniciar sesión para guardar favoritos');
      return;
    }

    setIsLoading(true);
    setIsAnimating(true);

    const result = await toggleFavorite(caseId);

    if (!result.success) {
      alert(result.error || 'Error al actualizar favorito');
    }

    setIsLoading(false);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        group relative inline-flex items-center gap-2 
        p-2 rounded-lg transition-all duration-200
        hover:bg-km-blush/50 active:scale-95
        ${isLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
        ${className}
      `}
      aria-label={favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      title={favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      {favorite ? (
        <StarSolid 
          className={`
            ${sizeClasses[size]} 
            text-yellow-500
            ${isAnimating ? 'animate-bounce' : ''}
            transition-transform
            group-hover:scale-110
          `}
        />
      ) : (
        <StarOutline 
          className={`
            ${sizeClasses[size]} 
            text-km-navy-400
            ${isAnimating ? 'animate-pulse' : ''}
            transition-all
            group-hover:text-yellow-500
            group-hover:scale-110
          `}
        />
      )}
      
      {showLabel && (
        <span className="text-xs sm:text-sm font-medium text-km-navy-700 group-hover:text-km-crimson">
          {favorite ? 'Guardado' : 'Guardar'}
        </span>
      )}

      {/* Tooltip on hover (desktop only) */}
      <span className="
        hidden hover-device:group-hover:block
        absolute -top-10 left-1/2 -translate-x-1/2
        bg-km-navy-900 text-white text-xs
        px-3 py-1.5 rounded-lg whitespace-nowrap
        pointer-events-none z-10
        after:content-[''] after:absolute
        after:top-full after:left-1/2 after:-translate-x-1/2
        after:border-4 after:border-transparent
        after:border-t-km-navy-900
      ">
        {favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      </span>
    </button>
  );
}
