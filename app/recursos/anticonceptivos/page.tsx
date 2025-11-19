import Link from 'next/link';
import { METODOS_ANTICONCEPTIVOS } from './data';

export default function GuiaAnticonceptivosPage() {
  return (
    <div className="bg-km-cream py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-km-cardinal">Guía Rápida de Anticonceptivos</h1>
          <p className="mt-4 text-lg text-km-text-700">
            Información basada en las normativas del Ministerio de Salud de Chile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {METODOS_ANTICONCEPTIVOS.map((metodo) => (
            <Link key={metodo.id} href={`/recursos/anticonceptivos/${metodo.id}`} className="block group">
              <div className="h-full card rounded-2xl p-8 transition-all duration-300 hover:shadow-km-lg hover:border-km-rose/30">
                <h3 className="text-xl font-bold text-km-crimson group-hover:text-km-rose transition-colors">{metodo.nombre}</h3>
                <p className="mt-2 text-sm text-km-text-500 font-medium">{metodo.tipo}</p>
                <p className="mt-4 text-base text-km-text-700 leading-relaxed">{metodo.descripcion}</p>
                <div className="mt-6">
                    <span className="font-bold text-km-crimson group-hover:text-km-rose transition-colors">
                        Ver detalles →
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
