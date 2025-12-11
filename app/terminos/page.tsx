'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, AlertTriangle, Shield, CreditCard, Lock, BookOpen, Scale } from 'lucide-react';

export default function TerminosPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Volver al inicio</span>
          </Link>
          
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Términos y Condiciones de Uso
              </h1>
              <p className="text-lg text-white/90 mb-3">
                KLINIK-MAT
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <span className="text-xs font-semibold text-white">Última actualización: Diciembre 2025</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          
          {/* Introducción */}
          <div className="p-8 md:p-10 border-b border-gray-200 bg-gradient-to-br from-amber-50/50 to-white">
            <p className="text-base text-gray-800 leading-relaxed">
              Bienvenido a <span className="font-bold text-red-600">KLINIK-MAT</span>. Antes de comenzar tu entrenamiento clínico, es indispensable que leas y aceptes las siguientes reglas de juego. Este documento es un contrato vinculante entre tú (en adelante el <span className="font-semibold">&quot;USUARIO&quot;</span>) y KLINIK-MAT (en adelante la <span className="font-semibold">&quot;PLATAFORMA&quot;</span>).
            </p>
          </div>

          {/* Sección 1: Naturaleza del Servicio */}
          <div className="p-8 md:p-10 border-b border-gray-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  1. Naturaleza del Servicio y Objeto
                </h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full border border-blue-300">
                  <span className="text-xs font-semibold text-blue-800">Servicio Educativo</span>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-semibold text-blue-900">
                En resumen: Somos un simulador educativo, no un hospital ni un consejero médico. Lo que aprendes aquí es para entrenar tu cerebro, no para aplicarlo a ciegas en pacientes.
              </p>
            </div>

            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">1.1. Servicio Educativo:</h3>
                <p className="leading-relaxed">KLINIK-MAT provee una plataforma digital de simulación de casos clínicos obstétricos y neonatales con fines estrictamente pedagógicos y de entrenamiento teórico.</p>
              </div>
              
              <div>
                <h3 className="font-bold text-gray-900 mb-2">1.2. No es Asesoramiento Médico:</h3>
                <p className="leading-relaxed">El contenido, algoritmos y resoluciones de casos NO constituyen consejo médico, diagnóstico ni tratamiento para pacientes reales. La PLATAFORMA no sustituye el juicio clínico profesional, la validación presencial ni la supervisión de un docente calificado.</p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">1.3. Exención de Telemedicina:</h3>
                <p className="leading-relaxed">El USUARIO reconoce que el uso de la PLATAFORMA no crea una relación médico-paciente.</p>
              </div>
            </div>
          </div>

          {/* Sección 2: Acceso y Cuenta */}
          <div className="p-8 md:p-10 border-b border-gray-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Lock className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  2. Acceso, Cuenta y Seguridad
                </h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full border border-purple-300">
                  <span className="text-xs font-semibold text-purple-800">Cuenta Personal</span>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-semibold text-purple-900">
                En resumen: Tu cuenta es tuya y de nadie más. No compartas tu clave, porque eso arruina tus estadísticas de aprendizaje y viola este contrato.
              </p>
            </div>

            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">2.1. Licencia de Uso:</h3>
                <p className="leading-relaxed">KLINIK-MAT otorga al USUARIO una licencia limitada, no exclusiva, intransferible y revocable para acceder al contenido contratado.</p>
              </div>
              
              <div>
                <h3 className="font-bold text-gray-900 mb-2">2.2. Intransferibilidad:</h3>
                <p className="leading-relaxed">Las credenciales de acceso (usuario y contraseña) son personales. Está prohibido compartir la cuenta con terceros. KLINIK-MAT se reserva el derecho de suspender cuentas que muestren actividad sospechosa de uso simultáneo o compartido (protección contra piratería).</p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">2.3. Veracidad de Datos:</h3>
                <p className="leading-relaxed">El USUARIO garantiza que la información proporcionada al registrarse (nombre, condición de estudiante/profesional, institución) es real.</p>
              </div>
            </div>
          </div>

          {/* Sección 3: Propiedad Intelectual */}
          <div className="p-8 md:p-10 border-b border-gray-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  3. Propiedad Intelectual y Fuentes
                </h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 rounded-full border border-emerald-300">
                  <span className="text-xs font-semibold text-emerald-800">Derechos de Autor</span>
                </div>
              </div>
            </div>
            
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-semibold text-emerald-900">
                En resumen: Los casos son nuestros, pero la ciencia es de todos. Usamos datos públicos y normas oficiales para crear contenido original. No copies ni revendas nuestro trabajo.
              </p>
            </div>

            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">3.1. Titularidad de KLINIK-MAT:</h3>
                <p className="leading-relaxed">El código fuente, diseño, interfaz, logotipos, textos de los casos clínicos, algoritmos de evaluación y la estructura de la PLATAFORMA son propiedad exclusiva de KLINIK-MAT, protegidos por la Ley 17.336 de Propiedad Intelectual en Chile.</p>
              </div>
              
              <div>
                <h3 className="font-bold text-gray-900 mb-2">3.2. Uso de Fuentes y Referencias:</h3>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <div>
                      <span className="font-semibold">Datos Públicos:</span> La PLATAFORMA utiliza datos estadísticos y demográficos obtenidos de datos.gob.cl y portales de transparencia gubernamental bajo licencias de datos abiertos para la construcción de perfiles epidemiológicos.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <div>
                      <span className="font-semibold">Normativa y Literatura:</span> Los protocolos médicos se basan en normas técnicas del MINSAL, guías de la OMS/OPS y literatura académica de referencia (&quot;Libros Claves&quot;). KLINIK-MAT realiza un uso transformador de esta información (hechos y ciencia) para crear obras educativas originales (casos simulados), citando las fuentes correspondientes bajo el principio de uso justo y derecho de cita.
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">3.3. Prohibiciones:</h3>
                <p className="leading-relaxed">Queda estrictamente prohibida la reproducción, distribución, ingeniería inversa o venta de los casos clínicos y contenidos de la PLATAFORMA sin autorización escrita.</p>
              </div>
            </div>
          </div>

          {/* Sección 4: Limitación de Responsabilidad */}
          <div className="p-8 md:p-10 border-b border-gray-200 bg-amber-50/30">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  4. Limitación de Responsabilidad
                </h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 rounded-full border border-amber-300">
                  <span className="text-xs font-semibold text-amber-800">Cláusula Crítica</span>
                </div>
              </div>
            </div>
            
            <div className="bg-amber-100 border-2 border-amber-300 rounded-lg p-4 mb-6">
              <p className="text-sm font-bold text-amber-900">
                En resumen: Si te equivocas en la vida real, es tu responsabilidad profesional. Nosotros te damos herramientas para estudiar, pero la medicina cambia y los pacientes varían.
              </p>
            </div>

            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">4.1. Responsabilidad Profesional:</h3>
                <p className="leading-relaxed">KLINIK-MAT, sus fundadores y colaboradores <span className="font-bold text-red-600">NO SERÁN RESPONSABLES</span> por ningún daño directo, indirecto, incidental o consecuente, incluyendo mala praxis médica, negligencia o errores de diagnóstico, derivados del uso que el USUARIO haga de la información adquirida en la PLATAFORMA en un entorno clínico real.</p>
              </div>
              
              <div>
                <h3 className="font-bold text-gray-900 mb-2">4.2. Exactitud de la Información:</h3>
                <p className="leading-relaxed">Aunque nos esforzamos por mantener los casos actualizados según la última evidencia (MINSAL/OMS), la medicina es una ciencia cambiante. KLINIK-MAT no garantiza que la información esté libre de errores u omisiones en todo momento. Es responsabilidad del USUARIO verificar la vigencia de la normativa en las fuentes oficiales antes de aplicarla.</p>
              </div>
            </div>
          </div>

          {/* Sección 5: Pagos y Suscripciones */}
          <div className="p-8 md:p-10 border-b border-gray-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CreditCard className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  5. Pagos, Suscripciones y Política de Devolución
                </h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 rounded-full border border-indigo-300">
                  <span className="text-xs font-semibold text-indigo-800">Condiciones Comerciales</span>
                </div>
              </div>
            </div>
            
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-semibold text-indigo-900">
                En resumen: Si compras una suscripción, se renueva automáticamente salvo que la canceles. Tienes derechos como consumidor, pero con reglas claras para productos digitales.
              </p>
            </div>

            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">5.1. Suscripciones:</h3>
                <p className="leading-relaxed">El acceso a los casos puede requerir el pago de una suscripción (mensual, semestral o anual). El cobro se realizará por adelantado.</p>
              </div>
              
              <div>
                <h3 className="font-bold text-gray-900 mb-2">5.2. Renovación Automática:</h3>
                <p className="leading-relaxed">Salvo que el USUARIO cancele su suscripción antes de la fecha de corte, esta se renovará automáticamente por el mismo periodo.</p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">5.3. Política de Reembolso y Retracto:</h3>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <div>
                      <span className="font-semibold">Derecho de Retracto:</span> Conforme a la normativa chilena para servicios digitales, el USUARIO podrá ejercer su derecho a retracto dentro de los 10 días siguientes a la contratación, siempre y cuando NO haya comenzado a utilizar el servicio sustancialmente (ej: haber resuelto más de 3 casos clínicos o accedido a material descargable).
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <div>
                      Si el servicio presenta fallas técnicas graves imputables a KLINIK-MAT que impidan su uso, se realizará el reembolso proporcional al tiempo no utilizado.
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sección 6: Privacidad */}
          <div className="p-8 md:p-10 border-b border-gray-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Lock className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  6. Privacidad y Protección de Datos
                </h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-100 rounded-full border border-cyan-300">
                  <span className="text-xs font-semibold text-cyan-800">Datos Personales</span>
                </div>
              </div>
            </div>
            
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-semibold text-cyan-900">
                En resumen: Tus datos académicos son privados. Los datos de los pacientes en los casos son ficticios o estadísticos públicos.
              </p>
            </div>

            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">6.1. Cumplimiento Normativo:</h3>
                <p className="leading-relaxed">KLINIK-MAT trata los datos personales del USUARIO (correo, nombre, datos de navegación y académicos) en conformidad con la Ley 19.628 sobre Protección de la Vida Privada.</p>
              </div>
              
              <div>
                <h3 className="font-bold text-gray-900 mb-2">6.2. Uso de Datos:</h3>
                <p className="leading-relaxed mb-2">Los datos se utilizan para:</p>
                <ul className="space-y-1 ml-4">
                  <li>(i) Gestión de la cuenta</li>
                  <li>(ii) Análisis de métricas de aprendizaje</li>
                  <li>(iii) Mejora de los algoritmos de la plataforma</li>
                </ul>
                <p className="leading-relaxed mt-2">No vendemos datos a terceros.</p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">6.3. Confidencialidad de Pacientes:</h3>
                <p className="leading-relaxed">Se reitera que los &quot;pacientes&quot; presentados en los casos son ficticios o construcciones sintéticas basadas en datos públicos anonimizados. No se vulnera la privacidad de pacientes reales.</p>
              </div>
            </div>
          </div>

          {/* Sección 7: Modificaciones */}
          <div className="p-8 md:p-10 border-b border-gray-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  7. Modificaciones y Vigencia
                </h2>
              </div>
            </div>
            
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold text-pink-900">
                En resumen: Podemos actualizar estas reglas. Si lo hacemos, te avisaremos.
              </p>
            </div>

            <p className="text-gray-700 leading-relaxed">
              KLINIK-MAT se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento para adaptarse a cambios legales o técnicos. Las actualizaciones serán notificadas en la plataforma. El uso continuado del servicio implica la aceptación de los nuevos términos.
            </p>
          </div>

          {/* Sección 8: Ley Aplicable */}
          <div className="p-8 md:p-10">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Scale className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  8. Ley Aplicable y Jurisdicción
                </h2>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed">
              Para cualquier controversia derivada de este contrato, las partes se someten a las leyes de la República de Chile y a la jurisdicción de los Tribunales Ordinarios de Justicia de la ciudad de Santiago.
            </p>
          </div>

          {/* Footer del documento */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 md:p-10 border-t border-gray-200">
            <div className="text-center space-y-3">
              <p className="text-sm font-semibold text-gray-700">
                Al utilizar KLINIK-MAT, declaras haber leído, comprendido y aceptado estos Términos y Condiciones en su totalidad.
              </p>
              <p className="text-sm text-gray-600">
                Para consultas legales, contacta a{' '}
                <a href="mailto:legal@klinik-mat.cl" className="text-red-600 hover:text-red-700 font-semibold">
                  legal@klinik-mat.cl
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Botón de regreso */}
        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
