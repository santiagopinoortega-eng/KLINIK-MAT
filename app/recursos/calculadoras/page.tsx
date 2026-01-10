'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  CalculatorIcon,
  CalendarIcon,
  ScaleIcon,
  HeartIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { calculateObstetricData, calculateIMC, formatDate, calculateEGByUSG } from './obstetric-utils';

type CalculatorType = 'fpp' | 'imc' | 'ecografia' | null;

export default function CalculadorasPage() {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>(null);
  
  // Estado FPP
  const [fur, setFur] = useState('');
  const [metodo, setMetodo] = useState<'naegele' | 'wahl'>('naegele');
  const [resultadoFPP, setResultadoFPP] = useState<ReturnType<typeof calculateObstetricData> | null>(null);
  const [errorFPP, setErrorFPP] = useState('');
  
  // Estado IMC
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [resultadoIMC, setResultadoIMC] = useState<ReturnType<typeof calculateIMC> | null>(null);
  const [errorIMC, setErrorIMC] = useState('');
  
  // Estado Ecografía
  const [lcc, setLcc] = useState('');
  const [resultadoEco, setResultadoEco] = useState<ReturnType<typeof calculateEGByUSG> | null>(null);
  const [errorEco, setErrorEco] = useState('');

  const calcularFPP = () => {
    if (!fur) return;
    setErrorFPP('');
    try {
      const furDate = new Date(fur);
      const resultado = calculateObstetricData(furDate, metodo);
      setResultadoFPP(resultado);
    } catch (error) {
      setErrorFPP(error instanceof Error ? error.message : 'Error al calcular FPP');
      setResultadoFPP(null);
    }
  };

  const calcularIMC = () => {
    if (!peso || !altura) return;
    setErrorIMC('');
    try {
      const resultado = calculateIMC(parseFloat(peso), parseFloat(altura));
      setResultadoIMC(resultado);
    } catch (error) {
      setErrorIMC(error instanceof Error ? error.message : 'Error al calcular IMC');
      setResultadoIMC(null);
    }
  };

  const calcularEcografia = () => {
    if (!lcc) return;
    setErrorEco('');
    try {
      const resultado = calculateEGByUSG(parseFloat(lcc));
      setResultadoEco(resultado);
    } catch (error) {
      setErrorEco(error instanceof Error ? error.message : 'Error al calcular edad gestacional');
      setResultadoEco(null);
    }
  };

  const resetAll = () => {
    setActiveCalculator(null);
    setResultadoFPP(null);
    setResultadoIMC(null);
    setResultadoEco(null);
    setErrorFPP('');
    setErrorIMC('');
    setErrorEco('');
    setFur('');
    setPeso('');
    setAltura('');
    setLcc('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/areas"
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Volver a Áreas
          </Link>
          
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 shadow-xl mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <CalculatorIcon className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
                  Calculadoras Obstétricas
                </h1>
                <p className="text-red-50 text-lg">Herramientas de cálculo para la práctica clínica</p>
              </div>
            </div>
          </div>
        </div>

        {/* Banner de Calculadoras de Medicamentos */}
        {!activeCalculator && (
          <div className="mb-8">
            <Link 
              href="/recursos/medicamentos"
              className="block bg-gradient-to-r from-red-500 via-rose-500 to-red-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.01] border border-red-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <span className="text-3xl">💊</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                      ✨ Calculadoras de Medicamentos Obstétricos
                      <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full font-bold">NUEVO</span>
                    </h3>
                    <p className="text-white/90 text-sm">
                      Sulfato de Magnesio, Oxitocina, Misoprostol, Profilaxis ATB y más
                    </p>
                  </div>
                </div>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        )}

        {/* Selector de Calculadoras */}
        {!activeCalculator && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <InformationCircleIcon className="w-6 h-6 text-red-600" />
              <p className="text-gray-900 font-semibold text-lg">Calculadoras de Evaluación Obstétrica</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* FPP Calculator */}
              <button
                onClick={() => setActiveCalculator('fpp')}
                className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all text-left"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform">
                  <CalendarIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">Fecha Probable de Parto</h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  Calcula FPP y edad gestacional según FUR
                </p>
                <span className="text-red-600 font-semibold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                  Calcular
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>

              {/* IMC Calculator */}
              <button
                onClick={() => setActiveCalculator('imc')}
                className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all text-left"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform">
                  <ScaleIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">IMC Pregestacional</h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  Calcula IMC y ganancia de peso recomendada
                </p>
                <span className="text-red-600 font-semibold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                  Calcular
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>

              {/* Ecografía Calculator */}
              <button
                onClick={() => setActiveCalculator('ecografia')}
                className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all text-left"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform">
                  <HeartIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">EG por Ecografía</h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  Calcula edad gestacional por LCC
                </p>
                <span className="text-red-600 font-semibold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                  Calcular
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </div>

            {/* Disclaimer */}
            <div className="mt-8 bg-red-50 border-l-4 border-red-500 rounded-r-xl p-6">
              <div className="flex items-start gap-3">
                <InformationCircleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-red-900 mb-2">Uso Clínico Responsable</h4>
                  <p className="text-sm text-red-800 leading-relaxed">
                    Estas calculadoras están basadas en Normas MINSAL y estándares internacionales (IOM, ACOG). 
                    Los resultados son referenciales y deben ser interpretados por personal de salud calificado en el contexto clínico de cada paciente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calculadora FPP */}
        {activeCalculator === 'fpp' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <CalendarIcon className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Fecha Probable de Parto</h2>
              </div>
              <button
                onClick={resetAll}
                className="text-gray-600 hover:text-red-600 font-semibold transition-colors"
              >
                ← Volver
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Fecha de Última Regla (FUR)
                </label>
                <input
                  type="date"
                  value={fur}
                  onChange={(e) => setFur(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:outline-none text-gray-900 transition-colors"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">Ingresa la fecha del primer día de tu última menstruación</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Método de Cálculo
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMetodo('naegele')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      metodo === 'naegele'
                        ? 'border-red-500 bg-red-50 shadow-md'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <div className="font-bold text-gray-900 mb-1">Regla de Naegele</div>
                    <div className="text-xs text-gray-600">FUR + 7 días - 3 meses (Más común)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetodo('wahl')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      metodo === 'wahl'
                        ? 'border-red-500 bg-red-50 shadow-md'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <div className="font-bold text-gray-900 mb-1">Regla de Wahl</div>
                    <div className="text-xs text-gray-600">FUR + 10 días - 3 meses</div>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={calcularFPP}
                disabled={!fur}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-4 rounded-xl hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-red-600 disabled:hover:to-red-700 shadow-lg hover:shadow-xl"
              >
                {!fur ? 'Ingresa la FUR para calcular' : 'Calcular FPP y Edad Gestacional'}
              </button>

              {errorFPP && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4">
                  <p className="text-red-800 font-semibold">⚠️ {errorFPP}</p>
                </div>
              )}

              {resultadoFPP && (
                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-2 text-green-600 mb-4">
                    <CheckCircleIcon className="w-6 h-6" />
                    <span className="font-bold text-lg">Resultados del Cálculo</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-5">
                      <div className="text-sm text-red-700 font-semibold mb-1">Fecha Probable de Parto</div>
                      <div className="text-2xl font-bold text-red-900">{formatDate(resultadoFPP.fpp)}</div>
                      <div className="text-xs text-red-600 mt-2">Método: {resultadoFPP.metodo.split('(')[0]}</div>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-xl p-5">
                      <div className="text-sm text-blue-700 font-semibold mb-1">Edad Gestacional Actual</div>
                      <div className="text-2xl font-bold text-blue-900">{resultadoFPP.egTexto}</div>
                      <div className="text-xs text-blue-600 mt-2">Trimestre: {resultadoFPP.trimestre}°</div>
                    </div>

                    <div className="bg-green-50 border-l-4 border-green-500 rounded-r-xl p-5">
                      <div className="text-sm text-green-700 font-semibold mb-1">Días Restantes</div>
                      <div className="text-2xl font-bold text-green-900">{resultadoFPP.diasRestantes} días</div>
                      <div className="text-xs text-green-600 mt-2">≈ {Math.round(resultadoFPP.diasRestantes / 7)} semanas</div>
                    </div>

                    <div className="bg-purple-50 border-l-4 border-purple-500 rounded-r-xl p-5">
                      <div className="text-sm text-purple-700 font-semibold mb-1">Progreso de Gestación</div>
                      <div className="text-2xl font-bold text-purple-900">{resultadoFPP.porcentajeGestacion}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                        <div 
                          className="bg-gradient-to-r from-red-500 to-red-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${resultadoFPP.porcentajeGestacion}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Calculadora IMC */}
        {activeCalculator === 'imc' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <ScaleIcon className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">IMC Pregestacional</h2>
              </div>
              <button
                onClick={resetAll}
                className="text-gray-600 hover:text-red-600 font-semibold transition-colors"
              >
                ← Volver
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Peso Pregestacional (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="200"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                    placeholder="Ej: 65.5"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:outline-none text-gray-900 transition-colors"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Peso antes del embarazo</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="120"
                    max="220"
                    value={altura}
                    onChange={(e) => setAltura(e.target.value)}
                    placeholder="Ej: 165"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:outline-none text-gray-900 transition-colors"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Altura en centímetros</p>
                </div>
              </div>

              <button
                type="button"
                onClick={calcularIMC}
                disabled={!peso || !altura || parseFloat(peso) <= 0 || parseFloat(altura) <= 0}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-4 rounded-xl hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-red-600 disabled:hover:to-red-700 shadow-lg hover:shadow-xl"
              >
                {!peso || !altura ? 'Completa todos los campos' : 'Calcular IMC y Ganancia Recomendada'}
              </button>

              {errorIMC && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4">
                  <p className="text-red-800 font-semibold">⚠️ {errorIMC}</p>
                </div>
              )}

              {resultadoIMC && (
                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-2 text-green-600 mb-4">
                    <CheckCircleIcon className="w-6 h-6" />
                    <span className="font-bold text-lg">Resultados del Cálculo</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-5">
                      <div className="text-sm text-red-700 font-semibold mb-1">IMC Pregestacional</div>
                      <div className="text-3xl font-bold text-red-900">{resultadoIMC.imc}</div>
                      <div className="text-sm text-red-700 mt-2 font-semibold">{resultadoIMC.categoria}</div>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-xl p-5">
                      <div className="text-sm text-blue-700 font-semibold mb-1">Ganancia Recomendada</div>
                      <div className="text-2xl font-bold text-blue-900">{resultadoIMC.gananciaRecomendada}</div>
                      <div className="text-xs text-blue-600 mt-2">Durante todo el embarazo</div>
                    </div>
                  </div>

                  <div className={`rounded-xl p-5 border-l-4 ${
                    resultadoIMC.categoria === 'Peso normal' 
                      ? 'bg-green-50 border-green-500' 
                      : 'bg-amber-50 border-amber-500'
                  }`}>
                    <div className="flex items-start gap-3">
                      <InformationCircleIcon className={`w-6 h-6 flex-shrink-0 ${
                        resultadoIMC.categoria === 'Peso normal' ? 'text-green-600' : 'text-amber-600'
                      }`} />
                      <div>
                        <div className={`font-bold mb-1 ${
                          resultadoIMC.categoria === 'Peso normal' ? 'text-green-900' : 'text-amber-900'
                        }`}>
                          Evaluación de Riesgo
                        </div>
                        <div className={`text-sm ${
                          resultadoIMC.categoria === 'Peso normal' ? 'text-green-800' : 'text-amber-800'
                        }`}>
                          {resultadoIMC.riesgo}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-red-600">📊</span>
                      Referencia IOM (Institute of Medicine)
                    </h4>
                    <div className="text-sm text-gray-700 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-red-600 font-bold">•</span>
                        <div><strong>Bajo peso (IMC {'<'}18.5):</strong> 12.5-18 kg</div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">•</span>
                        <div><strong>Peso normal (IMC 18.5-24.9):</strong> 11.5-16 kg</div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <div><strong>Sobrepeso (IMC 25-29.9):</strong> 7-11.5 kg</div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">•</span>
                        <div><strong>Obesidad (IMC ≥30):</strong> 5-9 kg</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Calculadora Ecografía */}
        {activeCalculator === 'ecografia' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <HeartIcon className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Edad Gestacional por Ecografía</h2>
              </div>
              <button
                onClick={resetAll}
                className="text-gray-600 hover:text-red-600 font-semibold transition-colors"
              >
                ← Volver
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Longitud Cráneo-Caudal (LCC) en mm
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="5"
                  max="100"
                  value={lcc}
                  onChange={(e) => setLcc(e.target.value)}
                  placeholder="Ej: 45.2"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:outline-none text-gray-900 transition-colors"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Válido para primer trimestre (6-14 semanas). Fórmula de Robinson y Fleming
                </p>
              </div>

              <button
                type="button"
                onClick={calcularEcografia}
                disabled={!lcc || parseFloat(lcc) <= 0}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-4 rounded-xl hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-red-600 disabled:hover:to-red-700 shadow-lg hover:shadow-xl"
              >
                {!lcc ? 'Ingresa la medición LCC' : 'Calcular Edad Gestacional'}
              </button>

              {errorEco && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4">
                  <p className="text-red-800 font-semibold">⚠️ {errorEco}</p>
                </div>
              )}

              {resultadoEco && (
                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-2 text-green-600 mb-4">
                    <CheckCircleIcon className="w-6 h-6" />
                    <span className="font-bold text-lg">Resultado del Cálculo</span>
                  </div>

                  <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-8 text-center">
                    <div className="text-sm text-red-700 font-semibold mb-3">Edad Gestacional Estimada</div>
                    <div className="text-5xl font-bold text-red-900 mb-3">
                      {resultadoEco.semanas} + {resultadoEco.dias}
                    </div>
                    <div className="text-base text-red-700 font-medium">semanas de gestación</div>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-xl p-5">
                    <div className="flex items-start gap-3">
                      <InformationCircleIcon className="w-6 h-6 text-blue-600 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-blue-900 mb-2">Nota Clínica</div>
                        <div className="text-sm text-blue-800 leading-relaxed">
                          La medición de LCC es más precisa en el primer trimestre (6-14 semanas). 
                          Para datación posterior se recomienda usar DBP, CC, CA y LF.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
