import { METODOS_ANTICONCEPTIVOS } from '../data';
import Link from 'next/link';

export default function MetodoDetailPage({ params }: { params: { id: string } }) {
  const metodo = METODOS_ANTICONCEPTIVOS.find((m) => m.id === params.id);

  if (!metodo) {
    return (
      <div className="flex flex-col items-center justify-center text-center bg-white p-12 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-primary-900">Método no encontrado</h1>
        <p className="mt-4 text-lg text-secondary-600">
          Lo sentimos, no pudimos encontrar el método anticonceptivo que estás buscando.
        </p>
        <Link href="/recursos/anticonceptivos" className="mt-8 inline-block bg-primary-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-700 transition-colors">
          Volver a la guía
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
            <Link href="/recursos/anticonceptivos" className="text-primary-600 hover:underline">
                ← Volver a la guía
            </Link>
        </div>

        <div className="bg-secondary-50 rounded-2xl p-8">
            <h1 className="text-3xl font-extrabold text-primary-900">{metodo.nombre}</h1>
            <p className="mt-2 text-lg text-secondary-600">{metodo.tipo}</p>
            
            <div className="mt-8 space-y-8">
                <div>
                    <h2 className="text-xl font-bold text-primary-800">Descripción</h2>
                    <p className="mt-2 text-base text-secondary-700">{metodo.descripcion}</p>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-primary-800">Efectividad</h2>
                    <p className="mt-2 text-base text-secondary-700">{metodo.efectividad}</p>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-primary-800">Mecanismo de Acción</h2>
                    <p className="mt-2 text-base text-secondary-700">{metodo.mecanismo}</p>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-primary-800">Ventajas</h2>
                    <ul className="mt-2 list-disc list-inside space-y-1 text-secondary-700">
                        {metodo.ventajas.map((ventaja, i) => (
                            <li key={i}>{ventaja}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-primary-800">Desventajas</h2>
                    <ul className="mt-2 list-disc list-inside space-y-1 text-secondary-700">
                        {metodo.desventajas.map((desventaja, i) => (
                            <li key={i}>{desventaja}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-primary-800">Criterios de Elegibilidad (MINSAL)</h2>
                    <a href={metodo.criterios} target="_blank" rel="noopener noreferrer" className="mt-2 text-primary-600 hover:underline">
                        Ver documento oficial →
                    </a>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
