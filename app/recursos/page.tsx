// app/recursos/page.tsx
import Link from 'next/link';

// Tu array de 'resources' está perfecto con los colores 'brand' y 'success'.
const resources = [
  {
    title: 'Guía Rápida de Anticonceptivos',
    description: 'Una guía interactiva para consultar rápidamente cada método anticonceptivo, su efectividad, criterios de elegibilidad y más.',
    href: '/recursos/anticonceptivos',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
    ),
    bgColor: 'bg-brand-600',
  },
  {
    title: 'Normativas MINSAL',
    description: 'Accede a las guías clínicas, protocolos y normativas oficiales del Ministerio de Salud de Chile sobre salud sexual y reproductiva.',
    href: '/recursos/minsal',
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    bgColor: 'bg-success-600',
  },
];

export default function RecursosPage() {
  return (
    <div>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          
          {/* --- ¡AQUÍ ESTÁ EL CAMBIO! --- 
            Aplicamos el mismo gradiente de texto que en la portada.
          */}
          <h1 className="text-4xl font-extrabold 
                     bg-gradient-to-r from-brand-700 to-brand-900 bg-clip-text text-transparent">
            Centro de Recursos
          </h1>
          
          <p className="mt-4 text-lg text-neutral-600">
            Herramientas y guías de referencia para potenciar tu aprendizaje.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {resources.map((resource) => (
            <Link key={resource.title} href={resource.href} className="block group">
              
              {/* Usamos la clase .card de globals.css */}
              <div className="card h-full flex flex-col items-center text-center transition-all duration-300 group-hover:shadow-lg group-hover:ring-brand-200/50">
                <div className={`flex-shrink-0 flex items-center justify-center h-20 w-20 rounded-full text-white ${resource.bgColor}`}>
                    {resource.icon}
                </div>
                
                {/* Texto de la tarjeta (neutral/gris oscuro) */}
                <h3 className="mt-6 text-xl font-bold text-neutral-900">{resource.title}</h3>
                <p className="mt-2 text-base text-neutral-700">{resource.description}</p>
                <div className="mt-6">
                    {/* Enlace de la tarjeta (brand/coral) */}
                    <span className="font-bold text-brand-600 group-hover:underline">
                        Ver más →
                    </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
