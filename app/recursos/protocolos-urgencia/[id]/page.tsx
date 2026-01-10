import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  BeakerIcon,
  ExclamationCircleIcon,
  ArrowRightCircleIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { getProtocolById } from '../data';

export default async function ProtocolDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const protocol = getProtocolById(id);

  if (!protocol) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
      {/* Header Rojo con gradiente */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Link
            href="/recursos/protocolos-urgencia"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="font-medium">Volver a Protocolos</span>
          </Link>

          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold flex-1">
              {protocol.title}
            </h1>
            {protocol.priority === 'critica' && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-bold whitespace-nowrap">
                <ExclamationTriangleIcon className="w-5 h-5" />
                CRÍTICA
              </div>
            )}
          </div>

          <p className="text-lg text-white/90 max-w-3xl mb-4">
            {protocol.definition}
          </p>

          {/* Ventana tiempo crítico */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
            <ClockIcon className="w-5 h-5" />
            <span className="font-semibold">Ventana Terapéutica:</span>
            <span className="font-bold text-yellow-300">{protocol.timeWindow}</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">


        {/* Presentación Clínica - TABLA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
            <div className="flex items-center gap-3">
              <ExclamationCircleIcon className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">Presentación Clínica</h2>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-16">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Signos y Síntomas
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {protocol.clinicalPresentation.map((symptom, idx) => (
                  <tr key={idx} className="hover:bg-red-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-sm">
                        {idx + 1}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-700 leading-relaxed">
                      {symptom}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Criterios Diagnósticos - TABLA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
            <div className="flex items-center gap-3">
              <BeakerIcon className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">Criterios Diagnósticos</h2>
            </div>
          </div>
          
          <div className="p-6">
            <ul className="space-y-3">
              {protocol.diagnosticCriteria.map((criterion, idx) => (
                <li key={idx} className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <CheckCircleIcon className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-800 leading-relaxed flex-1">{criterion}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>


        {/* Protocolo de Manejo Inicial - TABLA DE PASOS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
            <div className="flex items-center gap-3">
              <ArrowRightCircleIcon className="w-6 h-6 text-white" />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">Protocolo de Manejo Inicial</h2>
                <p className="text-sm text-white/90 mt-1">Seguir secuencialmente. No omitir pasos.</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">
                    Paso
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Acción
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Detalles
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                    Tiempo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {protocol.initialManagement.map((step) => (
                  <tr key={step.step} className="hover:bg-red-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-red-600 to-red-700 text-white font-bold text-lg shadow-sm">
                        {step.step}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-gray-900">{step.action}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 leading-relaxed">
                      {step.details}
                    </td>
                    <td className="px-4 py-4">
                      {step.timeframe && (
                        <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 rounded-lg">
                          <ClockIcon className="w-4 h-4 text-red-600" />
                          <span className="text-xs font-bold text-red-800 whitespace-nowrap">{step.timeframe}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>


        {/* Farmacoterapia - TABLA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-6 py-4">
            <div className="flex items-center gap-3">
              <BeakerIcon className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">Farmacoterapia</h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Medicamento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Dosis
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">
                    Vía
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Indicación
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {protocol.medications.map((med, idx) => (
                  <tr key={idx} className="hover:bg-green-50 transition-colors">
                    <td className="px-4 py-4">
                      <span className="font-bold text-gray-900">{med.drug}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 font-medium">
                      {med.dose}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">
                        {med.route}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 leading-relaxed">
                      {med.indication}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>


        {/* Banderas Rojas - Signos de Alarma */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-red-500 overflow-hidden">
          <div className="bg-gradient-to-r from-red-700 to-red-800 px-6 py-4">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-300" />
              <div>
                <h2 className="text-xl font-bold text-white">🚨 Banderas Rojas - Signos de Alarma</h2>
                <p className="text-sm text-red-100 mt-1">Requieren escalar manejo inmediatamente</p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 p-6">
            <ul className="space-y-3">
              {protocol.redFlags.map((flag, idx) => (
                <li key={idx} className="flex items-start gap-3 bg-white rounded-lg p-4 border-l-4 border-red-600 shadow-sm">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-800 font-medium leading-relaxed flex-1">{flag}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Criterios de Transferencia */}
        <div className="bg-white rounded-xl shadow-sm border border-orange-300 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-amber-700 px-6 py-4">
            <div className="flex items-center gap-3">
              <ArrowRightCircleIcon className="w-6 h-6 text-white" />
              <div>
                <h2 className="text-xl font-bold text-white">Criterios de Transferencia</h2>
                <p className="text-sm text-orange-100 mt-1">Considerar traslado a centro de mayor complejidad si:</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <ul className="space-y-3">
              {protocol.whenToTransfer.map((criterion, idx) => (
                <li key={idx} className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <ArrowRightCircleIcon className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-800 leading-relaxed flex-1">{criterion}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Nivel de Evidencia y Referencias */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
            <div className="flex items-center gap-3">
              <BookOpenIcon className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">Referencias y Evidencia</h2>
            </div>
          </div>

          <div className="p-6">
            {/* Nivel de Evidencia */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-blue-900">Nivel de Evidencia:</span>
                <span className="text-lg font-bold text-blue-600">{protocol.evidenceLevel}</span>
              </div>
            </div>

            {/* Referencias */}
            <div className="space-y-3">
              {protocol.references.map((ref, idx) => (
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
                    <p className="text-sm text-gray-900 font-medium leading-relaxed">
                      {ref.source}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
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

        {/* Disclaimer Médico-Legal */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-r-xl p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Disclaimer Médico-Legal</h3>
              <p className="text-sm text-yellow-800 leading-relaxed">
                Este protocolo es una guía de referencia basada en evidencia actualizada. 
                El juicio clínico del profesional tratante y el contexto individual del paciente 
                siempre priman sobre cualquier guía. Adaptar según recursos disponibles y 
                realidad local. En caso de duda, consultar con especialista.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
