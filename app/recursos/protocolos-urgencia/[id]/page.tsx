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
import { getProtocolById, PROTOCOL_CATEGORIES } from '../data';

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

  const category = PROTOCOL_CATEGORIES[protocol.category];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navegación */}
        <Link 
          href="/recursos/protocolos-urgencia"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Volver a Protocolos</span>
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6 border-2 border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className={`px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r ${category.color} text-white flex items-center gap-2`}>
              <span className="text-lg">{category.icon}</span>
              <span>{category.name}</span>
            </div>
            
            {protocol.priority === 'critica' && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-bold">
                <ExclamationTriangleIcon className="w-5 h-5" />
                EMERGENCIA CRÍTICA
              </div>
            )}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {protocol.title}
          </h1>

          {/* Ventana tiempo crítico */}
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <ClockIcon className="w-8 h-8 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-900">Ventana Terapéutica</p>
                <p className="text-2xl font-bold text-red-600">{protocol.timeWindow}</p>
              </div>
            </div>
          </div>

          {/* Definición */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Definición</h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              {protocol.definition}
            </p>
          </div>
        </div>

        {/* Presentación Clínica */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ExclamationCircleIcon className="w-7 h-7 text-blue-600" />
            Presentación Clínica
          </h2>
          <ul className="space-y-3">
            {protocol.clinicalPresentation.map((symptom, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-blue-600">{idx + 1}</span>
                </div>
                <p className="text-gray-700 leading-relaxed">{symptom}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Criterios Diagnósticos */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BeakerIcon className="w-7 h-7 text-purple-600" />
            Criterios Diagnósticos
          </h2>
          <ul className="space-y-3">
            {protocol.diagnosticCriteria.map((criterion, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircleIcon className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700 leading-relaxed">{criterion}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Manejo Inicial - PROTOCOLO PASO A PASO */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl shadow-xl p-8 mb-6 border-2 border-red-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <ArrowRightCircleIcon className="w-8 h-8 text-red-600" />
            Protocolo de Manejo Inicial
          </h2>
          <p className="text-sm text-gray-600 mb-6">Seguir secuencialmente. No omitir pasos.</p>

          <div className="space-y-4">
            {protocol.initialManagement.map((step) => (
              <div 
                key={step.step}
                className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-red-600"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-white">{step.step}</span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{step.action}</h3>
                      {step.timeframe && (
                        <div className="flex items-center gap-1 px-3 py-1 bg-red-100 rounded-full">
                          <ClockIcon className="w-4 h-4 text-red-600" />
                          <span className="text-xs font-bold text-red-800">{step.timeframe}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{step.details}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Medicamentos */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BeakerIcon className="w-7 h-7 text-green-600" />
            Farmacoterapia
          </h2>
          
          <div className="grid gap-4">
            {protocol.medications.map((med, idx) => (
              <div key={idx} className="bg-green-50 rounded-xl p-5 border-2 border-green-200">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{med.drug}</h3>
                  <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                    {med.route}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-semibold text-green-800 uppercase">Dosis:</span>
                    <p className="text-sm text-gray-700 font-medium">{med.dose}</p>
                  </div>
                  
                  <div>
                    <span className="text-xs font-semibold text-green-800 uppercase">Indicación:</span>
                    <p className="text-sm text-gray-700">{med.indication}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Banderas Rojas */}
        <div className="bg-red-900 rounded-2xl shadow-2xl p-8 mb-6 border-2 border-red-700">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-7 h-7 text-red-300" />
            Banderas Rojas - Signos de Alarma
          </h2>
          <p className="text-red-100 text-sm mb-4">Requieren escalar manejo inmediatamente</p>
          
          <ul className="space-y-3">
            {protocol.redFlags.map((flag, idx) => (
              <li key={idx} className="flex items-start gap-3 bg-red-800 rounded-lg p-4">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                <p className="text-white font-medium leading-relaxed">{flag}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Cuándo Transferir */}
        <div className="bg-orange-50 rounded-2xl shadow-xl p-8 mb-6 border-2 border-orange-300">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ArrowRightCircleIcon className="w-7 h-7 text-orange-600" />
            Criterios de Transferencia
          </h2>
          <p className="text-sm text-gray-700 mb-4">Considerar traslado a centro de mayor complejidad si:</p>
          
          <ul className="space-y-2">
            {protocol.whenToTransfer.map((criterion, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <ArrowRightCircleIcon className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">{criterion}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Nivel de Evidencia y Referencias */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpenIcon className="w-7 h-7 text-indigo-600" />
            Referencias y Evidencia
          </h2>

          <div className="bg-indigo-50 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-indigo-900 mb-1">Nivel de Evidencia:</p>
            <p className="text-lg font-bold text-indigo-600">{protocol.evidenceLevel}</p>
          </div>

          <div className="space-y-3">
            {protocol.references.map((ref, idx) => (
              <div key={idx} className="border-l-4 border-indigo-300 pl-4 py-2">
                <div className="flex items-start gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    ref.type === 'MINSAL' ? 'bg-blue-100 text-blue-800' :
                    ref.type === 'ACOG' ? 'bg-purple-100 text-purple-800' :
                    ref.type === 'RCOG' ? 'bg-green-100 text-green-800' :
                    ref.type === 'WHO' ? 'bg-cyan-100 text-cyan-800' :
                    ref.type === 'Paper' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {ref.type}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-medium">{ref.source}</p>
                    <p className="text-xs text-gray-600 mt-1">{ref.year}</p>
                    {ref.url && (
                      <a 
                        href={ref.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:text-indigo-800 underline mt-1 inline-block"
                      >
                        Ver fuente →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer de advertencia */}
        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-xl">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-900 mb-1">Disclaimer Médico-Legal</p>
              <p className="text-xs text-yellow-800 leading-relaxed">
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
