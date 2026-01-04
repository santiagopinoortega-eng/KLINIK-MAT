'use client';

import { useState } from 'react';
import Link from 'next/link';
import { calcularDosisObstetricas, type ResultadoCalculo } from '@/lib/calculadoras/obstetricia';

type CalculadoraActiva = 'mgso4' | 'oxitocina' | 'misoprostol' | 'profilaxis' | null;

export default function CalculadorasMedicamentos() {
  const [calculadoraActiva, setCalculadoraActiva] = useState<CalculadoraActiva>(null);
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);

  // Estados para cada calculadora
  const [pesoMgSO4, setPesoMgSO4] = useState('60');
  const [dosisMiliUnidades, setDosisMiliUnidades] = useState('2');
  const [viaMisoprostol, setViaMisoprostol] = useState<'vaginal' | 'sublingual'>('vaginal');
  const [dosisMisoprostol, setDosisMisoprostol] = useState('25');
  const [antibiotico, setAntibiotico] = useState<'cefazolina' | 'clindamicina' | 'gentamicina'>('cefazolina');
  const [pesoProfilaxis, setPesoProfilaxis] = useState('70');

  const calcular = () => {
    let result: ResultadoCalculo | null = null;

    switch (calculadoraActiva) {
      case 'mgso4':
        result = calcularDosisObstetricas.mgso4(parseFloat(pesoMgSO4), 50);
        break;
      case 'oxitocina':
        result = calcularDosisObstetricas.oxitocina(parseFloat(dosisMiliUnidades));
        break;
      case 'misoprostol':
        result = calcularDosisObstetricas.misoprostol(viaMisoprostol, parseFloat(dosisMisoprostol));
        break;
      case 'profilaxis':
        result = calcularDosisObstetricas.profilaxisQuirurgica(antibiotico, parseFloat(pesoProfilaxis));
        break;
    }

    setResultado(result);
  };

  const limpiar = () => {
    setResultado(null);
    setCalculadoraActiva(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb y navegación */}
        <div className="mb-8 flex items-center gap-4">
          <Link 
            href="/recursos/calculadoras" 
            className="inline-flex items-center text-rose-600 hover:text-rose-700 font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Calculadoras
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-800 px-4 py-2 rounded-full text-sm font-bold mb-4">
            💊 Calculadoras de Medicamentos
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Calculadoras de{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">
              Medicamentos
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Dosificación de medicamentos obstétricos según protocolos MINSAL Chile.
          </p>
        </div>

        {!calculadoraActiva ? (
          /* Grid de Calculadoras */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sulfato de Magnesio */}
            <button
              onClick={() => setCalculadoraActiva('mgso4')}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105 text-left border-2 border-transparent hover:border-rose-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">💊</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sulfato de Magnesio</h3>
              <p className="text-gray-600 text-sm mb-3">
                Esquema Zuspan para prevención/tratamiento de eclampsia
              </p>
              <div className="flex items-center text-rose-600 font-semibold text-sm">
                Calcular dosis
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Oxitocina */}
            <button
              onClick={() => setCalculadoraActiva('oxitocina')}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105 text-left border-2 border-transparent hover:border-rose-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Oxitocina</h3>
              <p className="text-gray-600 text-sm mb-3">
                Inducción y conducción del trabajo de parto
              </p>
              <div className="flex items-center text-blue-600 font-semibold text-sm">
                Calcular flujo
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Misoprostol */}
            <button
              onClick={() => setCalculadoraActiva('misoprostol')}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105 text-left border-2 border-transparent hover:border-rose-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🔬</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Misoprostol</h3>
              <p className="text-gray-600 text-sm mb-3">
                Maduración cervical e inducción del parto
              </p>
              <div className="flex items-center text-purple-600 font-semibold text-sm">
                Calcular dosis
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Profilaxis Quirúrgica */}
            <button
              onClick={() => setCalculadoraActiva('profilaxis')}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105 text-left border-2 border-transparent hover:border-rose-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">💉</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Profilaxis ATB</h3>
              <p className="text-gray-600 text-sm mb-3">
                Antibióticos profilácticos para cesárea
              </p>
              <div className="flex items-center text-green-600 font-semibold text-sm">
                Calcular dosis
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        ) : (
          /* Formulario de Calculadora Activa */
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl mx-auto">
            <button
              onClick={limpiar}
              className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver a calculadoras
            </button>

            {/* Sulfato de Magnesio */}
            {calculadoraActiva === 'mgso4' && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">💊 Sulfato de Magnesio</h2>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Peso de la paciente (kg)
                    </label>
                    <input
                      type="number"
                      value={pesoMgSO4}
                      onChange={(e) => setPesoMgSO4(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-colors"
                      placeholder="Ej: 60"
                    />
                  </div>
                </div>
                <button
                  onClick={calcular}
                  className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold py-4 px-6 rounded-lg hover:from-rose-700 hover:to-pink-700 transition-all transform hover:scale-[1.02] shadow-lg"
                >
                  Calcular Dosis
                </button>
              </div>
            )}

            {/* Oxitocina */}
            {calculadoraActiva === 'oxitocina' && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">⚡ Oxitocina</h2>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dosis deseada (mUI/min)
                    </label>
                    <input
                      type="number"
                      value={dosisMiliUnidades}
                      onChange={(e) => setDosisMiliUnidades(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                      placeholder="Ej: 2"
                      step="0.5"
                    />
                    <p className="text-xs text-gray-500 mt-1">Rango habitual: 0.5 - 20 mUI/min</p>
                  </div>
                </div>
                <button
                  onClick={calcular}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:scale-[1.02] shadow-lg"
                >
                  Calcular Flujo
                </button>
              </div>
            )}

            {/* Misoprostol */}
            {calculadoraActiva === 'misoprostol' && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">🔬 Misoprostol</h2>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vía de administración
                    </label>
                    <select
                      value={viaMisoprostol}
                      onChange={(e) => setViaMisoprostol(e.target.value as 'vaginal' | 'sublingual')}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                    >
                      <option value="vaginal">Vaginal</option>
                      <option value="sublingual">Sublingual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dosis (mcg)
                    </label>
                    <input
                      type="number"
                      value={dosisMisoprostol}
                      onChange={(e) => setDosisMisoprostol(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                      placeholder="Ej: 25"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Vaginal: máx 25 mcg | Sublingual: máx 50 mcg
                    </p>
                  </div>
                </div>
                <button
                  onClick={calcular}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-[1.02] shadow-lg"
                >
                  Verificar Dosis
                </button>
              </div>
            )}

            {/* Profilaxis */}
            {calculadoraActiva === 'profilaxis' && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">💉 Profilaxis Antibiótica</h2>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Antibiótico
                    </label>
                    <select
                      value={antibiotico}
                      onChange={(e) => setAntibiotico(e.target.value as 'cefazolina' | 'clindamicina' | 'gentamicina')}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                    >
                      <option value="cefazolina">Cefazolina (1ª elección)</option>
                      <option value="clindamicina">Clindamicina (alergia a penicilinas)</option>
                      <option value="gentamicina">Gentamicina (combinada)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Peso de la paciente (kg)
                    </label>
                    <input
                      type="number"
                      value={pesoProfilaxis}
                      onChange={(e) => setPesoProfilaxis(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                      placeholder="Ej: 70"
                    />
                  </div>
                </div>
                <button
                  onClick={calcular}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-[1.02] shadow-lg"
                >
                  Calcular Dosis
                </button>
              </div>
            )}

            {/* Resultado */}
            {resultado && (
              <div className="mt-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  Resultado
                </h3>
                
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="text-3xl font-bold text-gray-900">
                    {resultado.resultado} <span className="text-xl text-gray-600">{resultado.unidad}</span>
                  </p>
                  {resultado.preparacion && (
                    <p className="text-sm text-gray-600 mt-2">{resultado.preparacion}</p>
                  )}
                </div>

                {resultado.interpretacion && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                    <p className="text-sm font-medium text-blue-900 whitespace-pre-line">{resultado.interpretacion}</p>
                  </div>
                )}

                {resultado.alertas && resultado.alertas.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-900 text-sm mb-2">Consideraciones clínicas:</p>
                    {resultado.alertas.map((alerta, index) => (
                      <div 
                        key={index} 
                        className={`flex items-start gap-2 text-sm p-2 rounded ${
                          alerta.includes('🔴') 
                            ? 'bg-red-50 text-red-800' 
                            : alerta.includes('⚠️')
                            ? 'bg-yellow-50 text-yellow-800'
                            : 'bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span className="flex-shrink-0 mt-0.5">{alerta.split(' ')[0]}</span>
                        <span>{alerta.substring(alerta.indexOf(' ') + 1)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-12 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 max-w-4xl mx-auto">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">⚠️</span>
            <div>
              <h4 className="font-bold text-yellow-900 mb-2">Aviso Importante</h4>
              <p className="text-sm text-yellow-800">
                Estas calculadoras son herramientas de apoyo educativo basadas en protocolos MINSAL Chile. 
                Los resultados <strong>NO reemplazan</strong> el juicio clínico profesional ni la evaluación individualizada de cada paciente. 
                Siempre consulte con su supervisor clínico y los protocolos institucionales vigentes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
