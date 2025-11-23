'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { CaseImage, QuestionImage } from '@/lib/types';

type ImageViewerProps = {
  images: (CaseImage | QuestionImage)[];
  className?: string;
};

export function ImageViewer({ images, className = '' }: ImageViewerProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  const sortedImages = [...images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <>
      <div className={`grid gap-4 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} ${className}`}>
        {sortedImages.map((img, idx) => (
          <figure key={img.id || idx} className="relative group cursor-pointer">
            <div
              className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors"
              onClick={() => setSelectedImage(idx)}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {/* Overlay para indicar que se puede hacer clic */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                  />
                </svg>
              </div>
            </div>
            {img.caption && (
              <figcaption className="mt-2 text-sm text-gray-600 italic text-center">
                {img.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={() => setSelectedImage(null)}
            aria-label="Cerrar"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Navegación */}
          {sortedImages.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors disabled:opacity-30"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage((prev) => (prev! > 0 ? prev! - 1 : sortedImages.length - 1));
                }}
                aria-label="Imagen anterior"
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors disabled:opacity-30"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage((prev) => (prev! < sortedImages.length - 1 ? prev! + 1 : 0));
                }}
                aria-label="Imagen siguiente"
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Imagen principal */}
          <div className="relative max-w-6xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full h-full">
              <Image
                src={sortedImages[selectedImage].url}
                alt={sortedImages[selectedImage].alt}
                width={1200}
                height={800}
                className="object-contain w-full h-full"
                priority
              />
            </div>
            {sortedImages[selectedImage].caption && (
              <p className="mt-4 text-center text-white text-lg">
                {sortedImages[selectedImage].caption}
              </p>
            )}
            {/* Contador */}
            {sortedImages.length > 1 && (
              <p className="mt-2 text-center text-gray-300 text-sm">
                {selectedImage + 1} / {sortedImages.length}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
