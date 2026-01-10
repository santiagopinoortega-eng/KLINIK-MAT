'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BeakerIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { calcularInfusion, ejemplosComunes, type ParametrosInfusion, type ResultadoInfusion } from '@/lib/calculadoras/infusiones';

export default function CalculadoraMedicamentosPage() {
  // Estados del formulario
  const [dosisDeseada, setDosisDeseada] = useState('');
  const [unidadDosis, setUnidadDosis] = useState<'mg' | 'mcg' | 'g' | 'UI' | 'mEq'>('mg');
  
  const [concentracionAmpolla, setConcentracionAmpolla] = useState('');
  const [unidadConcentracion, setUnidadConcentracion] = useState<'mg' | 'mcg' | 'g' | 'UI' | 'mEq'>('mg');
  const [volumenAmpolla, setVolumenAmpolla] = useState('');
  
  const [volumenDilucion, setVolumenDilucion] = useState('');
  
  const [tipoVelocidad, setTipoVelocidad] = useState<'boloUnico' | 'infusionContinua' | 'dosisPorPeso'>('boloUnico');
  const [duracionInfusion, setDuracionInfusion] = useState('');
  
  const [pesoKg, setPesoKg] = useState('');
  const [dosisPorKg, setDosisPorKg] = useState('');
  
  // Estados de resultado y error
  const [resultado, setResultado] = useState<ResultadoInfusion | null>(null);
  const [error, setError] = useState('');
  
  const calcular = () => {
    setError('');
    setResultado(null);
    
    try {
      const params: ParametrosInfusion = {
        dosisDeseada: tipoVelocidad === 'dosisPorPeso' ? 0 : parseFloat(dosisDeseada),
        unidadDosis,
        concentracionAmpolla: parseFloat(concentracionAmpolla),
        unidadConcentracion,
        volumenAmpolla: parseFloat(volumenAmpolla),
        volumenDilucion: volumenDilucion ? parseFloat(volumenDilucion) : undefined,
        tipoVelocidad,
        duracionInfusion: duracionInfusion ? parseFloat(duracionInfusion) : undefined,
        pesoKg: pesoKg ? parseFloat(pesoKg) : undefined,
        dosisPorKg: dosisPorKg ? parseFloat(dosisPorKg) : undefined,
      };
      
      const res = calcularInfusion(params);
      setResultado(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al calcular');
    }
  };
  
  const cargarEjemplo = (index: number) => {
    const ejemplo = ejemplosComunes[index];
    const p = ejemplo.params;
    
    setDosisDeseada(p.dosisDeseada.toString());
    setUnidadDosis(p.unidadDosis);
    setConcentracionAmpolla(p.concentracionAmpolla.toString());
    setUnidadConcentracion(p.unidadConcentracion);
    setVolumenAmpolla(p.volumenAmpolla.toString());
    setVolumenDilucion(p.volumenDilucion ? p.volumenDilucion.toString() : '');
    setTipoVelocidad(p.tipoVelocidad);
    setDuracionInfusion(p.duracionInfusion ? p.duracionInfusion.toString() : '');
    setPesoKg(p.pesoKg ? p.pesoKg.toString() : '');
    setDosisPorKg(p.dosisPorKg ? p.dosisPorKg.toString() : '');
    
    setResultado(null);
    setError('');
  };
  
  const limpiar = () => {
    setDosisDeseada('');
    setConcentracionAmpolla('');
    setVolumenAmpolla('');
    setVolumenDilucion('');
    setDuracionInfusion('');
    setPesoKg('');
    setDosisPorKg('');
    setResultado(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/recursos/calculadoras"
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Volver a Calculadoras
          </Link>
          
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl shadow-2xl p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <BeakerIcon className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight">
                  Calculadora de Infusiones
                </h1>
                <p className="text-red-100 text-lg font-medium mt-1">
                  Cálculo preciso de dosis y velocidades de medicamentos
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-red-50">
              <InformationCircleIcon className="w-6 h-6" />
              <p className="text-base">
                Herramienta profesional para calcular volúmenes, diluciones y velocidades de infusión
              </p>
            </div>
          </div>
        </div>

        {/* Ejemplos rápidos */}
        <div className="mb-8 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <SparklesIcon className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-bold text-blue-900">Ejemplos rápidos</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {ejemplosComunes.map((ejemplo, index) => (
              <button
                key={index}
                onClick={() => cargarEjemplo(index)}
                className="bg-white hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-400 rounded-lg p-4 text-left transition-all group"
              >
                <p className="font-bold text-blue-900 group-hover:text-blue-700">{ejemplo.nombre}</p>
                <p className="text-xs text-blue-600 mt-1">Click para cargar</p>
              </button>
            ))}
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8 mb-8">
          <div className="space-y-8">
            
            {/* Tipo de administración */}
            <div>
              <label className="block text-gray-900 font-bold mb-3 text-lg">
                Tipo de administración
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => setTipoVelocidad('boloUnico')}
                  className={`p-4 rounded-xl border-2 font-semibold transition-all ${
                    tipoVelocidad === 'boloUnico'
                      ? 'bg-red-50 border-red-500 text-red-900'
                      : 'bg-gray-50 border-gray-300 text-gray-700 hover:border-red-300'
                  }`}
                >
                  Bolo único
                </button>
                <button
                  onClick={() => setTipoVelocidad('infusionContinua')}
                  className={`p-4 rounded-xl border-2 font-semibold transition-all ${
                    tipoVelocidad === 'infusionContinua'
                      ? 'bg-red-50 border-red-500 text-red-900'
                      : 'bg-gray-50 border-gray-300 text-gray-700 hover:border-red-300'
                  }`}
                >
                  Infusión continua
                </button>
                <button
                  onClick={() => setTipoVelocidad('dosisPorPeso')}
                  className={`p-4 rounded-xl border-2 font-semibold transition-all ${
                    tipoVelocidad === 'dosisPorPeso'
                      ? 'bg-red-50 border-red-500 text-red-900'
                      : 'bg-gray-50 border-gray-300 text-gray-700 hover:border-red-300'
                  }`}
                >
                  Dosis por peso
                </button>
              </div>
            </div>

            {/* Sección 1: Dosis prescrita */}
            <div className="border-l-4 border-red-500 pl-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">1. Dosis prescrita</h3>
              
              {tipoVelocidad === 'dosisPorPeso' ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Peso del paciente (kg)
                      </label>
                      <input
                        type="number"
                        value={pesoKg}
                        onChange={(e) => setPesoKg(e.target.value)}
                        placeholder="Ej: 70"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Dosis por kg
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={dosisPorKg}
                          onChange={(e) => setDosisPorKg(e.target.value)}
                          placeholder="Ej: 0.5"
                          step="0.01"
                          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-colors"
                        />
                        <select
                          value={unidadDosis}
                          onChange={(e) => setUnidadDosis(e.target.value as any)}
                          className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-colors"
                        >
                          <option value="mg">mg/kg</option>
                          <option value="mcg">mcg/kg</option>
                          <option value="g">g/kg</option>
                          <option value="UI">UI/kg</option>
                          <option value="mEq">mEq/kg</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Dosis
                    </label>
                    <input
                      type="number"
                      value={dosisDeseada}
                      onChange={(e) => setDosisDeseada(e.target.value)}
                      placeholder="Ej: 500"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-colors"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Unidad
                    </label>
                    <select
                      value={unidadDosis}
                      onChange={(e) => setUnidadDosis(e.target.value as any)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-colors"
                    >
                      <option value="mg">mg (miligramos)</option>
                      <option value="mcg">mcg (microgramos)</option>
                      <option value="g">g (gramos)</option>
                      <option value="UI">UI (Unidades Internacionales)</option>
                      <option value="mEq">mEq (miliequivalentes)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Sección 2: Presentación del medicamento */}
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">2. Presentación del medicamento</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Concentración
                  </label>
                  <input
                    type="number"
                    value={concentracionAmpolla}
                    onChange={(e) => setConcentracionAmpolla(e.target.value)}
                    placeholder="Ej: 500"
                    step="0.01"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Unidad
                  </label>
                  <select
                    value={unidadConcentracion}
                    onChange={(e) => setUnidadConcentracion(e.target.value as any)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  >
                    <option value="mg">mg</option>
                    <option value="mcg">mcg</option>
                    <option value="g">g</option>
                    <option value="UI">UI</option>
                    <option value="mEq">mEq</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Volumen (ml)
                  </label>
                  <input
                    type="number"
                    value={volumenAmpolla}
                    onChange={(e) => setVolumenAmpolla(e.target.value)}
                    placeholder="Ej: 10"
                    step="0.1"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Ejemplo: Ampolla de 500 mg en 10 ml
              </p>
            </div>

            {/* Sección 3: Dilución (opcional) */}
            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">3. Dilución (opcional)</h3>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Volumen de dilución (ml)
                </label>
                <input
                  type="number"
                  value={volumenDilucion}
                  onChange={(e) => setVolumenDilucion(e.target.value)}
                  placeholder="Ej: 100 (dejar vacío si no se diluye)"
                  step="0.1"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                />
                <p className="text-sm text-gray-600 mt-2">
                  Volumen de suero fisiológico, dextrosa o agua para diluir
                </p>
              </div>
            </div>

            {/* Sección 4: Velocidad de infusión (solo si es infusión continua) */}
            {tipoVelocidad === 'infusionContinua' && (
              <div className="border-l-4 border-green-500 pl-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">4. Tiempo de infusión</h3>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Duración (minutos)
                  </label>
                  <input
                    type="number"
                    value={duracionInfusion}
                    onChange={(e) => setDuracionInfusion(e.target.value)}
                    placeholder="Ej: 60"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Tiempo en que debe administrarse el medicamento
                  </p>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={calcular}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <div className="flex items-center justify-center gap-2">
                  <BeakerIcon className="w-6 h-6" />
                  <span>Calcular</span>
                </div>
              </button>
              <button
                onClick={limpiar}
                className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-8">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-red-900 mb-1">Error</h4>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Resultados */}
        {resultado && (
          <div className="space-y-6">
            {/* Resultado principal */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
                <h3 className="text-2xl font-bold text-green-900">Resultado del cálculo</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <p className="text-sm text-gray-600 font-medium mb-2">Dosis total</p>
                  <p className="text-3xl font-black text-gray-900">{resultado.dosisTotal}</p>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <p className="text-sm text-gray-600 font-medium mb-2">Volumen a administrar</p>
                  <p className="text-3xl font-black text-gray-900">{resultado.volumenAdministrar}</p>
                </div>
                
                {resultado.velocidadMlHora && (
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <p className="text-sm text-gray-600 font-medium mb-2">Velocidad (bomba de infusión)</p>
                    <p className="text-3xl font-black text-blue-900">{resultado.velocidadMlHora}</p>
                  </div>
                )}
                
                {resultado.velocidadGotasMin && (
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <p className="text-sm text-gray-600 font-medium mb-2">Goteo (macrogotero)</p>
                    <p className="text-3xl font-black text-purple-900">{resultado.velocidadGotasMin}</p>
                  </div>
                )}
                
                {resultado.concentracionFinal && (
                  <div className="bg-white rounded-xl p-6 shadow-sm md:col-span-2">
                    <p className="text-sm text-gray-600 font-medium mb-2">Concentración final</p>
                    <p className="text-2xl font-black text-gray-900">{resultado.concentracionFinal}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Explicación paso a paso */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
              <h4 className="font-bold text-blue-900 mb-4 text-lg flex items-center gap-2">
                <InformationCircleIcon className="w-6 h-6" />
                Paso a paso del cálculo
              </h4>
              <ol className="space-y-2">
                {resultado.explicacion.map((paso, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="font-bold text-blue-600 flex-shrink-0">{index + 1}.</span>
                    <span className="text-blue-900">{paso}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Alertas */}
            {resultado.alertas && resultado.alertas.length > 0 && (
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6">
                <h4 className="font-bold text-yellow-900 mb-4 text-lg flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-6 h-6" />
                  Alertas de seguridad
                </h4>
                <ul className="space-y-2">
                  {resultado.alertas.map((alerta, index) => (
                    <li key={index} className="flex gap-3 items-start">
                      <span className="text-yellow-600 text-xl flex-shrink-0">•</span>
                      <span className="text-yellow-900">{alerta}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-12 bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-8">
          <div className="flex items-start gap-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-red-900 mb-3">Aviso Médico-Legal</h3>
              <div className="space-y-2 text-red-800 text-sm leading-relaxed">
                <p>
                  Esta calculadora es una <strong>herramienta de apoyo</strong> para profesionales de la salud. 
                  Los resultados deben ser <strong>verificados</strong> antes de la administración.
                </p>
                <p>
                  <strong>La responsabilidad final</strong> sobre la prescripción, preparación y administración de medicamentos 
                  recae exclusivamente en el profesional tratante.
                </p>
                <p>
                  Siempre verifique: dosis, concentraciones, compatibilidades, alergias del paciente y protocolos institucionales.
                </p>
                <p className="font-bold mt-4">
                  Esta herramienta NO reemplaza el juicio clínico ni los protocolos locales.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
