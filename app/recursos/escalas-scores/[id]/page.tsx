import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  ScaleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  BookOpenIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { getScaleById } from '../data';

export default async function ScaleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scale = getScaleById(id);

  if (!scale) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
      {/* Header Rojo con gradiente */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Link
            href="/recursos/escalas-scores"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="font-medium">Volver a Escalas y Scores</span>
          </Link>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {scale.name}
          </h1>
          <p className="text-lg text-white/90 max-w-3xl">
            {scale.description}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Información Básica - Grid de Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Rango de Puntaje */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-600 mb-1">Rango de Puntaje</h3>
                <p className="text-3xl font-bold text-red-600">
                  {scale.totalScoreRange.min} - {scale.totalScoreRange.max}
                </p>
                <p className="text-sm text-gray-500 mt-1">puntos totales</p>
              </div>
            </div>
          </div>

          {/* Momento de Aplicación */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Momento de Aplicación</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{scale.timingApplication}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Indicación */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-xl p-6">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Indicación Clínica</h3>
              <p className="text-sm text-blue-800 leading-relaxed">{scale.indication}</p>
            </div>
          </div>
        </div>


        {/* Parámetros de Evaluación - TABLA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
            <div className="flex items-center gap-3">
              <ScaleIcon className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">Parámetros de Evaluación</h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {scale.parameters.map((param, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Título del parámetro */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white text-sm font-bold">
                      {idx + 1}
                    </span>
                    <h3 className="font-bold text-gray-900">{param.name}</h3>
                  </div>
                </div>

                {/* Tabla de valores */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">
                          Puntaje
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Criterio / Descripción
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {param.values.map((value, vIdx) => (
                        <tr key={vIdx} className="hover:bg-red-50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-red-600 to-red-700 text-white font-bold text-lg">
                              {value.score}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-900">
                                {value.description}
                              </div>
                              {value.criteria && (
                                <div className="text-sm text-gray-600 leading-relaxed">
                                  {value.criteria}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interpretación del Puntaje - TABLA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
            <div className="flex items-center gap-3">
              <ChartBarIcon className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">Interpretación del Puntaje</h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                    Puntaje
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Clasificación
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Significado Clínico
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Recomendación
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {scale.interpretation.map((interp, idx) => (
                  <tr key={idx} className="hover:bg-red-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-br from-red-600 to-red-700 text-white font-bold text-lg">
                        {interp.range}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-gray-900">{interp.classification}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 leading-relaxed">
                      {interp.clinicalSignificance}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          {interp.recommendation}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>


        {/* Perlas Clínicas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <LightBulbIcon className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">Perlas Clínicas</h2>
            </div>
          </div>
          <div className="p-6">
            <ul className="space-y-3">
              {scale.clinicalPearls.map((pearl, idx) => (
                <li key={idx} className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <span className="text-2xl flex-shrink-0">💡</span>
                  <p className="text-gray-800 leading-relaxed flex-1">{pearl}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Limitaciones */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">Limitaciones de la Escala</h2>
            </div>
          </div>
          <div className="p-6">
            <ul className="space-y-3">
              {scale.limitations.map((limitation, idx) => (
                <li key={idx} className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-800 leading-relaxed flex-1">{limitation}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Referencias y Evidencia */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
            <div className="flex items-center gap-3">
              <BookOpenIcon className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">Referencias y Evidencia</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {scale.references.map((ref, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-red-300 transition-colors"
                >
                  <span
                    className={`px-3 py-1 rounded-md text-xs font-bold flex-shrink-0 ${
                      ref.type === 'MINSAL'
                        ? 'bg-blue-600 text-white'
                        : ref.type === 'ACOG'
                        ? 'bg-purple-600 text-white'
                        : ref.type === 'RCOG'
                        ? 'bg-green-600 text-white'
                        : ref.type === 'WHO'
                        ? 'bg-cyan-600 text-white'
                        : ref.type === 'Paper'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-600 text-white'
                    }`}
                  >
                    {ref.type}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 leading-relaxed mb-1">
                      {ref.citation}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 font-medium">{ref.year}</span>
                      {ref.url && (
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-red-600 hover:text-red-800 font-medium underline flex items-center gap-1"
                        >
                          Ver documento
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Aviso Importante */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-r-xl p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Aviso Importante - Uso Clínico</h3>
              <p className="text-sm text-yellow-800 leading-relaxed">
                Esta escala es una herramienta de apoyo diagnóstico y debe interpretarse 
                en el contexto clínico del paciente individual. No sustituye la evaluación 
                clínica integral, el juicio médico, ni los protocolos institucionales locales. 
                Siempre consulte guías y protocolos actualizados de su institución.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
