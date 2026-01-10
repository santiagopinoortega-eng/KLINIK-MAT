import { METODOS_ANTICONCEPTIVOS } from '../data';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ShieldCheckIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function MetodoDetailPage({ params }: { params: { id: string } }) {
  const metodo = METODOS_ANTICONCEPTIVOS.find((m) => m.id === params.id);

  if (!metodo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-12 shadow-xl text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircleIcon className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Método no encontrado</h1>
          <p className="text-gray-600 mb-8">
            No pudimos encontrar el método anticonceptivo que buscas.
          </p>
          <Link 
            href="/recursos/anticonceptivos" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Volver a la guía
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link 
            href="/recursos/anticonceptivos"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="font-medium">Volver a anticonceptivos</span>
          </Link>
          
          <div>
            <span className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium mb-4">
              {metodo.tipo}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
              {metodo.nombre}
            </h1>
            <p className="text-lg text-white/90">
              {metodo.descripcion}
            </p>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Efectividad y Duración */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheckIcon className="w-6 h-6 text-red-600" />
              <h2 className="text-lg font-bold text-gray-900">Efectividad</h2>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {metodo.efectividadPerfecto || metodo.efectividad}
            </p>
            {metodo.efectividadTipico && (
              <p className="text-sm text-gray-600 mt-1">
                Uso típico: {metodo.efectividadTipico}
              </p>
            )}
          </div>

          {metodo.duracion && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <ClockIcon className="w-6 h-6 text-red-600" />
                <h2 className="text-lg font-bold text-gray-900">Duración</h2>
              </div>
              <p className="text-lg font-semibold text-gray-700">
                {metodo.duracion}
              </p>
            </div>
          )}
        </div>

        {/* Mecanismo de Acción */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 mb-8 border border-red-100">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <DocumentTextIcon className="w-6 h-6 text-red-600" />
            Mecanismo de Acción
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {metodo.mecanismo}
          </p>
        </div>

        {/* Ventajas y Desventajas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Ventajas */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
              Ventajas
            </h2>
            <ul className="space-y-2">
              {metodo.ventajas.map((ventaja, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{ventaja}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Desventajas */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <XCircleIcon className="w-6 h-6 text-red-600" />
              Desventajas
            </h2>
            <ul className="space-y-2">
              {metodo.desventajas.map((desventaja, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{desventaja}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contraindicaciones */}
        {metodo.contraindicaciones && metodo.contraindicaciones.length > 0 && (
          <div className="bg-red-50 rounded-xl p-6 mb-8 border-2 border-red-200">
            <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              Contraindicaciones
            </h2>
            <ul className="space-y-2">
              {metodo.contraindicaciones.map((contra, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-red-900 text-sm font-medium">{contra}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Criterios OMS */}
        {metodo.criteriosOMS && (
          <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-200">
            <h2 className="text-lg font-bold text-blue-900 mb-2">
              Criterios de Elegibilidad OMS
            </h2>
            <p className="text-blue-800 text-sm">
              {metodo.criteriosOMS}
            </p>
          </div>
        )}

        {/* Documento MINSAL */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            Normativa MINSAL
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Consulta el documento oficial del Ministerio de Salud de Chile para información detallada sobre criterios de elegibilidad y protocolos de uso.
          </p>
          <a 
            href={metodo.criterios} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            <DocumentTextIcon className="w-5 h-5" />
            Ver documento oficial
          </a>
        </div>
      </div>
    </div>
  );
}
