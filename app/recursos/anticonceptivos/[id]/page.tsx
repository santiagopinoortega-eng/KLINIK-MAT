import { METODOS_ANTICONCEPTIVOS } from '../data';
import Link from 'next/link';

export default function MetodoDetailPage({ params }: { params: { id: string } }) {
  const metodo = METODOS_ANTICONCEPTIVOS.find((m) => m.id === params.id);

  if (!metodo) {
    return (
      <div className="flex flex-col items-center justify-center text-center bg-white p-12 rounded-lg shadow-km-md">
        <h1 className="text-4xl font-bold text-km-cardinal">Método no encontrado</h1>
        <p className="mt-4 text-lg text-km-text-700">
          Lo sentimos, no pudimos encontrar el método anticonceptivo que estás buscando.
        </p>
        <Link href="/recursos/anticonceptivos" className="mt-8 btn btn-lg btn-primary">
          Volver a la guía
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-km-cream py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
            <Link href="/recursos/anticonceptivos" className="text-km-crimson hover:text-km-rose transition-colors font-semibold">
                ← Volver a la guía
            </Link>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-km-md border border-km-crimson/10">
            <h1 className="text-3xl font-extrabold text-km-cardinal">{metodo.nombre}</h1>
            <p className="mt-2 text-lg text-km-text-700">{metodo.tipo}</p>
            
            <div className="mt-8 space-y-8">
                <div>
                    <h2 className="text-xl font-bold text-km-crimson">Descripción</h2>
                    <p className="mt-2 text-base text-km-text-700 leading-relaxed">{metodo.descripcion}</p>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-km-crimson">Efectividad</h2>
                    <p className="mt-2 text-base text-km-text-700 leading-relaxed">{metodo.efectividad}</p>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-km-crimson">Mecanismo de Acción</h2>
                    <p className="mt-2 text-base text-km-text-700 leading-relaxed">{metodo.mecanismo}</p>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-km-crimson">Ventajas</h2>
                    <ul className="mt-2 list-disc list-inside space-y-1 text-km-text-700">
                        {metodo.ventajas.map((ventaja, i) => (
                            <li key={i}>{ventaja}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-km-crimson">Desventajas</h2>
                    <ul className="mt-2 list-disc list-inside space-y-1 text-km-text-700">
                        {metodo.desventajas.map((desventaja, i) => (
                            <li key={i}>{desventaja}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-km-crimson">Criterios de Elegibilidad (MINSAL)</h2>
                    <a href={metodo.criterios} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-km-crimson hover:text-km-rose transition-colors font-semibold">
                        Ver documento oficial →
                    </a>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
