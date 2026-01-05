'use client';

import Link from 'next/link';
import { ArrowLeftIcon, HeartIcon } from '@heroicons/react/24/outline';
import LcfSimulator from '../escalas-scores/components/LcfSimulator';

export default function SimuladorFCFPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/areas"
            className="inline-flex items-center text-emerald-600 hover:text-emerald-800 mb-4 group"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Volver a Recursos
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
              <HeartIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Simulador de Latidos Cardiofetales
              </h1>
              <p className="text-gray-600 mt-1">
                Practica la interpretación de FCF con patrones normales y patológicos
              </p>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg mt-6">
            <div className="flex items-start gap-3">
              <HeartIcon className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-emerald-900 mb-1">
                  Herramienta de Práctica Interactiva
                </h3>
                <p className="text-sm text-emerald-800">
                  Este simulador te permite practicar la interpretación de frecuencia cardiaca fetal 
                  con audio realista y casos clínicos. Experimenta con diferentes patrones: 
                  bradicardia, taquicardia, variabilidad normal/reducida, aceleraciones y desaceleraciones.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Simulator */}
        <LcfSimulator />

        {/* Additional Info */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Sobre el Simulador
          </h2>
          
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🎯 Objetivos de Aprendizaje</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Identificar patrones normales y anormales de FCF</li>
                <li>Reconocer bradicardia y taquicardia fetal</li>
                <li>Evaluar variabilidad de la frecuencia cardíaca</li>
                <li>Distinguir aceleraciones y desaceleraciones (DIP I, II, III)</li>
                <li>Correlacionar hallazgos con situaciones clínicas</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">📚 Referencias Clínicas</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>FCF Normal: 110-160 lpm (American College of Obstetricians and Gynecologists)</li>
                <li>Bradicardia: {'<'}110 lpm | Taquicardia: {'>'}160 lpm</li>
                <li>Variabilidad normal: 6-25 lpm (latido a latido)</li>
                <li>Aceleraciones: Aumento ≥15 lpm por ≥15 seg (signo de bienestar fetal)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">⚠️ Uso Educativo</h3>
              <p className="text-gray-600">
                Este simulador es una herramienta educativa. En la práctica clínica real, 
                la interpretación de FCF debe considerar el contexto clínico completo, 
                historia materna, edad gestacional y otros parámetros de monitorización fetal.
              </p>
            </div>
          </div>
        </div>

        {/* Related Resources */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Recursos Relacionados
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/recursos/escalas-scores" className="group block">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl hover:border-indigo-300 transition-all">
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  Escalas y Scores Clínicos
                </h3>
                <p className="text-sm text-gray-600">
                  Bishop, Apgar, Ballard, Silverman-Andersen, Perfil Biofísico y más
                </p>
              </div>
            </Link>

            <Link href="/recursos/protocolos-urgencia" className="group block">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl hover:border-red-300 transition-all">
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                  Protocolos de Urgencia
                </h3>
                <p className="text-sm text-gray-600">
                  Guías rápidas para emergencias obstétricas
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
