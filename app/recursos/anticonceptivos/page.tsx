import Link from 'next/link';
import { METODOS_ANTICONCEPTIVOS } from './data';

export default function GuiaAnticonceptivosPage() {
  return (
    <div className="bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-primary-900">Guía Rápida de Anticonceptivos</h1>
          <p className="mt-4 text-lg text-secondary-600">
            Información basada en las normativas del Ministerio de Salud de Chile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {METODOS_ANTICONCEPTIVOS.map((metodo) => (
            <Link key={metodo.id} href={`/recursos/anticonceptivos/${metodo.id}`} className="block group">
              <div className="h-full bg-secondary-50 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-xl font-bold text-primary-800">{metodo.nombre}</h3>
                <p className="mt-2 text-sm text-secondary-600">{metodo.tipo}</p>
                <p className="mt-4 text-base text-secondary-700">{metodo.descripcion}</p>
                <div className="mt-6">
                    <span className="font-bold text-primary-600 group-hover:underline">
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
