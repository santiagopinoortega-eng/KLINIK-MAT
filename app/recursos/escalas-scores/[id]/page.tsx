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
import { getScaleById, getCategoryById } from '../data';

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

  const category = getCategoryById(scale.category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Navigation */}
        <Link
          href="/recursos/escalas-scores"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6 group"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Volver a Escalas y Scores
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-100">
          {/* Category Badge */}
          <div className="mb-4">
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r ${category?.color} text-white shadow-sm`}
            >
              {category?.icon} {category?.name}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {scale.name}
          </h1>

          {/* Score Range */}
          <div className="flex items-center gap-3 mb-6 bg-indigo-50 rounded-lg p-4 border border-indigo-200">
            <ChartBarIcon className="w-6 h-6 text-indigo-600" />
            <div>
              <div className="text-sm font-medium text-indigo-900">Rango de Puntaje</div>
              <div className="text-2xl font-bold text-indigo-600">
                {scale.totalScoreRange.min} - {scale.totalScoreRange.max} puntos
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            {scale.description}
          </p>

          {/* Indication */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-blue-900 mb-1">Indicación</div>
                <p className="text-sm text-blue-800">{scale.indication}</p>
              </div>
            </div>
          </div>

          {/* Timing */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-start gap-3">
              <ClockIcon className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-purple-900 mb-1">Momento de Aplicación</div>
                <p className="text-sm text-purple-800">{scale.timingApplication}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Parameters Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <ScaleIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Parámetros de Evaluación</h2>
          </div>

          <div className="space-y-6">
            {scale.parameters.map((param, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl p-6 hover:border-indigo-300 transition-colors">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold">
                    {idx + 1}
                  </span>
                  {param.name}
                </h3>
                <div className="space-y-3">
                  {param.values.map((value, vIdx) => (
                    <div 
                      key={vIdx}
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-lg flex-shrink-0">
                        {value.score}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 mb-1">
                          {value.description}
                        </div>
                        {value.criteria && (
                          <div className="text-sm text-gray-600 leading-relaxed">
                            {value.criteria}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interpretation Section */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-8 mb-6 text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <ChartBarIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Interpretación del Puntaje</h2>
          </div>

          <div className="space-y-4">
            {scale.interpretation.map((interp, idx) => (
              <div 
                key={idx}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="px-4 py-2 bg-white rounded-lg">
                    <div className="text-xs font-semibold text-teal-600 mb-1">PUNTAJE</div>
                    <div className="text-2xl font-bold text-teal-700">{interp.range}</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{interp.classification}</h3>
                    <p className="text-white/90 leading-relaxed">
                      {interp.clinicalSignificance}
                    </p>
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 border-l-4 border-white">
                  <div className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5" />
                    Recomendación
                  </div>
                  <p className="text-white/90 text-sm leading-relaxed">
                    {interp.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Pearls */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
              <LightBulbIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Perlas Clínicas</h2>
          </div>
          <ul className="space-y-3">
            {scale.clinicalPearls.map((pearl, idx) => (
              <li key={idx} className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex-shrink-0 mt-0.5">
                  💡
                </div>
                <p className="text-gray-800 leading-relaxed flex-1">{pearl}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Limitations */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Limitaciones</h2>
          </div>
          <ul className="space-y-3">
            {scale.limitations.map((limitation, idx) => (
              <li key={idx} className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-800 leading-relaxed flex-1">{limitation}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* References */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-8 mb-6 text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <BookOpenIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Referencias y Evidencia</h2>
          </div>

          <div className="space-y-4">
            {scale.references.map((ref, idx) => (
              <div 
                key={idx}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-bold flex-shrink-0 ${
                      ref.type === 'MINSAL'
                        ? 'bg-blue-500 text-white'
                        : ref.type === 'ACOG'
                        ? 'bg-purple-500 text-white'
                        : ref.type === 'RCOG'
                        ? 'bg-green-500 text-white'
                        : ref.type === 'WHO'
                        ? 'bg-cyan-500 text-white'
                        : ref.type === 'Paper'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-500 text-white'
                    }`}
                  >
                    {ref.type}
                  </span>
                  <div className="flex-1">
                    <p className="text-white/90 text-sm leading-relaxed mb-1">
                      {ref.citation}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white/70">{ref.year}</span>
                      {ref.url && (
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-white hover:text-white/80 underline flex items-center gap-1"
                        >
                          Ver fuente
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
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-r-xl p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">Aviso Importante</h3>
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
