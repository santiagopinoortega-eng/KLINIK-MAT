'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, FileText, Globe, Mail, CreditCard, Server } from 'lucide-react';

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-12 md:py-16">
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
              <Shield className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Política de Privacidad y Protección de Datos
              </h1>
              <p className="text-lg text-white/90 mb-3">
                La confidencialidad es parte de nuestra ética profesional
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
          <div className="p-8 md:p-10 border-b border-gray-200 bg-gradient-to-br from-blue-50/50 to-white">
            <p className="text-base text-gray-800 leading-relaxed mb-4">
              En <span className="font-bold text-blue-600">KLINIK-MAT</span>, la confidencialidad es parte de nuestra ética profesional. Esta Política de Privacidad describe cómo recopilamos, utilizamos y blindamos tu información personal y académica, cumpliendo con la normativa chilena <span className="font-semibold">(Ley 19.628)</span>.
            </p>
            <div className="bg-blue-100 border-l-4 border-blue-600 p-4 rounded-r-lg">
              <p className="text-sm font-semibold text-blue-900">
                🛡️ Nuestro principio rector es la <span className="underline">Minimización de Datos</span>: solo recopilamos lo estrictamente necesario para que tu entrenamiento clínico sea efectivo y seguro.
              </p>
            </div>
          </div>

          {/* Sección 1: Responsable del Tratamiento */}
          <div className="p-8 md:p-10 border-b border-gray-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  1. Responsable del Tratamiento
                </h2>
              </div>
            </div>

            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">
                La entidad responsable de la gestión de tus datos es <span className="font-bold text-indigo-600">KLINIK-MAT</span>.
              </p>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-indigo-900 mb-2">📧 Contacto para Privacidad:</p>
                <p className="text-sm text-indigo-800">
                  <span className="font-semibold">Email:</span> <a href="mailto:privacidad@klinik-mat.cl" className="underline hover:text-indigo-600">privacidad@klinik-mat.cl</a>
                </p>
                <p className="text-sm text-indigo-800">
                  <span className="font-semibold">Domicilio:</span> Santiago, Chile
                </p>
              </div>
            </div>
          </div>

          {/* Sección 2: ¿Qué Datos Recopilamos? */}
          <div className="p-8 md:p-10 border-b border-gray-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Database className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  2. ¿Qué Datos Recopilamos?
                </h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full border border-blue-300">
                  <span className="text-xs font-semibold text-blue-800">Simulación Personalizada</span>
                </div>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed mb-6">
              Para ofrecerte un entorno de simulación personalizado, tratamos los siguientes tipos de datos:
            </p>

            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="font-bold text-gray-900 mb-3">A. Datos de Identidad (Gestionados externamente)</h3>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><span className="font-semibold">Nombre completo</span></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><span className="font-semibold">Correo electrónico</span></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><span className="font-semibold">Foto de perfil (Avatar)</span></span>
                  </li>
                </ul>
                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg mt-4">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">🔒 Nota de Seguridad:</span> Las contraseñas <span className="font-bold underline">NUNCA</span> se almacenan en nuestros servidores. La autenticación es gestionada íntegramente por <span className="font-semibold">Clerk</span>, un proveedor certificado que utiliza los más altos estándares de encriptación.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-3">B. Datos Académicos y de Perfil</h3>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><span className="font-semibold">Institución educativa</span> (Universidad/CFT)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><span className="font-semibold">Año de carrera</span></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><span className="font-semibold">Especialidad</span></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><span className="font-semibold">País de residencia</span></span>
                  </li>
                </ul>
                <p className="text-sm text-gray-600 mt-3 italic">
                  Estos datos nos permiten adaptar la dificultad de los casos a tu nivel formativo.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-3">C. Datos de Rendimiento (Tu &quot;Historia Clínica&quot; Académica)</h3>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><span className="font-semibold">Resultados de los casos clínicos resueltos</span></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><span className="font-semibold">Tiempos de respuesta</span>, patrones de error y aciertos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><span className="font-semibold">Listas de favoritos</span> y sesiones de estudio</span>
                  </li>
                </ul>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-emerald-900">
                    <span className="font-semibold">✅ Privacidad:</span> Estas métricas son completamente privadas y solo tú (y opcionalmente, tu docente si es una cuenta institucional) puedes verlas.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-3">D. Datos Técnicos</h3>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><span className="font-semibold">Dirección IP</span></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><span className="font-semibold">Métricas de uso anónimas</span> para asegurar la estabilidad del sistema</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-red-700 mb-3">⚠️ LO QUE NO RECOPILAMOS:</h3>
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-5">
                  <ul className="space-y-2 text-sm text-red-900">
                    <li className="flex items-start gap-2">
                      <span className="font-bold">❌</span>
                      <span><span className="font-semibold">Datos Financieros Sensibles:</span> No almacenamos números de tarjeta de crédito ni códigos de seguridad. Toda transacción es procesada en los servidores seguros de <span className="font-bold">Mercado Pago</span>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">❌</span>
                      <span><span className="font-semibold">Datos de Salud Reales:</span> Los &quot;pacientes&quot; de los casos son simulaciones ficticias. No tratamos datos sensibles de pacientes reales.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sección 3: Uso de la Información */}
          <div className="p-8 md:p-10 border-b border-gray-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Eye className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  3. Uso de la Información
                </h2>
              </div>
            </div>

            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed mb-4">Utilizamos tus datos exclusivamente para:</p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <span className="text-2xl">📚</span>
                  <div>
                    <p className="font-semibold text-gray-900">Prestación del Servicio</p>
                    <p className="text-sm text-gray-700">Darte acceso a la plataforma y guardar tu progreso.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <p className="font-semibold text-gray-900">Personalización</p>
                    <p className="text-sm text-gray-700">Analizar tus áreas débiles para sugerirte casos específicos.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <p className="font-semibold text-gray-900">Seguridad</p>
                    <p className="text-sm text-gray-700">Prevenir accesos no autorizados y proteger tu cuenta.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección 4: Proveedores y Seguridad */}
          <div className="p-8 md:p-10 border-b border-gray-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Server className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  4. Proveedores y Seguridad (Quién Procesa tus Datos)
                </h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-100 rounded-full border border-cyan-300">
                  <span className="text-xs font-semibold text-cyan-800">Encargados del Tratamiento</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-gray-700">
              <div className="bg-cyan-50 border-l-4 border-cyan-600 p-4 rounded-r-lg mb-6">
                <p className="text-sm text-cyan-900">
                  <span className="font-semibold">🛡️ KLINIK-MAT no vende tus datos.</span> Para operar, utilizamos infraestructura de clase mundial. Estos proveedores actúan como &quot;Encargados del Tratamiento&quot;:
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-lg shadow-sm">
                  <thead className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Proveedor</th>
                      <th className="px-4 py-3 text-left font-semibold">Función</th>
                      <th className="px-4 py-3 text-left font-semibold">Estándar de Seguridad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold text-cyan-700">Mercado Pago</td>
                      <td className="px-4 py-3">Procesamiento de Pagos y Seguridad Financiera</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">PCI-DSS Compliant</span>
                        <p className="text-xs text-gray-600 mt-1">Incluye monitoreo anti-fraude, revisión humana de transacciones riesgosas y protección contra contracargos.</p>
                      </td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-gray-100">
                      <td className="px-4 py-3 font-bold text-cyan-700">Clerk</td>
                      <td className="px-4 py-3">Autenticación y Gestión de Identidad</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">SOC 2 Type II</span>
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold ml-1">ISO 27001</span>
                        <p className="text-xs text-gray-600 mt-1">Maneja tu login y 2FA con máxima seguridad.</p>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold text-cyan-700">Vercel / Railway</td>
                      <td className="px-4 py-3">Alojamiento e Infraestructura</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">HTTPS/TLS</span>
                        <p className="text-xs text-gray-600 mt-1">Encriptación de datos en reposo y en tránsito.</p>
                      </td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-gray-100">
                      <td className="px-4 py-3 font-bold text-cyan-700">Sentry</td>
                      <td className="px-4 py-3">Monitoreo de Errores</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">GDPR</span>
                        <p className="text-xs text-gray-600 mt-1">Rastreo de fallos técnicos sin acceder a información personal sensible.</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-5 mt-6">
                <div className="flex items-start gap-3">
                  <CreditCard className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-blue-900 mb-2">💳 Nota sobre Pagos:</p>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      Al pagar, <span className="font-bold">Mercado Pago</span> se encarga de proteger la transacción con sus modelos de seguridad actualizados para prevenir fraudes. <span className="font-semibold">KLINIK-MAT solo recibe la confirmación del pago aprobado</span>, nunca tus datos bancarios.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección 5: Seguridad de los Datos */}
          <div className="p-8 md:p-10 border-b border-gray-200 bg-emerald-50/30">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Lock className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  5. Seguridad de los Datos
                </h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 rounded-full border border-emerald-300">
                  <span className="text-xs font-semibold text-emerald-800">Seguridad por Diseño</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed mb-4">Implementamos <span className="font-bold text-emerald-700">&quot;Seguridad por Diseño&quot;</span>:</p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white border-2 border-emerald-300 rounded-lg p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-3xl">🔒</span>
                    <h3 className="font-bold text-gray-900 text-lg">Encriptación</h3>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">Toda comunicación viaja encriptada (HTTPS/TLS).</p>
                </div>

                <div className="bg-white border-2 border-emerald-300 rounded-lg p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-3xl">🗄️</span>
                    <h3 className="font-bold text-gray-900 text-lg">Base de Datos Blindada</h3>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">Tu progreso se almacena en bases de datos PostgreSQL encriptadas.</p>
                </div>

                <div className="bg-white border-2 border-emerald-300 rounded-lg p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-3xl">🛡️</span>
                    <h3 className="font-bold text-gray-900 text-lg">Protección contra Ataques</h3>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">Usamos Rate Limiting y protección CSRF para evitar accesos maliciosos.</p>
                </div>

                <div className="bg-white border-2 border-emerald-300 rounded-lg p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-3xl">🔍</span>
                    <h3 className="font-bold text-gray-900 text-lg">Monitoreo Continuo</h3>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">Sentry monitorea errores técnicos 24/7 sin capturar información personal.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sección 6: Tus Derechos */}
          <div className="p-8 md:p-10 border-b border-gray-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <UserCheck className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  6. Tus Derechos (ARCO)
                </h2>
              </div>
            </div>

            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed mb-4">Como usuario, tienes derecho a:</p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                  <span className="font-bold text-orange-700 text-xl">A</span>
                  <div>
                    <p className="font-semibold text-gray-900">Acceso:</p>
                    <p className="text-sm">Pedir copia de tus datos.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                  <span className="font-bold text-orange-700 text-xl">R</span>
                  <div>
                    <p className="font-semibold text-gray-900">Rectificación:</p>
                    <p className="text-sm">Corregir tu información académica o personal.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                  <span className="font-bold text-orange-700 text-xl">C</span>
                  <div>
                    <p className="font-semibold text-gray-900">Cancelación:</p>
                    <p className="text-sm">Solicitar la eliminación de tu cuenta y todo tu historial.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                  <span className="font-bold text-orange-700 text-xl">O</span>
                  <div>
                    <p className="font-semibold text-gray-900">Oposición:</p>
                    <p className="text-sm">Oponerte al envío de correos no esenciales.</p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-100 border-2 border-orange-400 rounded-lg p-6 mt-6">
                <p className="font-bold text-orange-900 mb-2">📧 ¿Cómo ejercer tus derechos?</p>
                <p className="text-sm text-orange-900 mb-3">
                  Contáctanos al correo oficial de soporte:
                </p>
                <p className="text-sm font-semibold text-orange-900">
                  <a href="mailto:privacidad@klinik-mat.cl" className="underline hover:text-orange-700">privacidad@klinik-mat.cl</a>
                </p>
              </div>
            </div>
          </div>

          {/* Sección 7: Cookies */}
          <div className="p-8 md:p-10">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl">🍪</span>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  7. Cookies
                </h2>
              </div>
            </div>

            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                Usamos <span className="font-semibold">cookies estrictamente necesarias</span> para mantener tu sesión activa y segura. <span className="font-bold text-pink-700">No utilizamos cookies de rastreo publicitario invasivo.</span>
              </p>
              
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                <p className="text-sm text-pink-900">
                  <span className="font-semibold">🍪 Tipos de cookies que usamos:</span>
                </p>
                <ul className="text-sm text-pink-900 mt-2 space-y-1 ml-4">
                  <li>• <span className="font-semibold">Cookies de sesión:</span> Para mantenerte conectado de forma segura</li>
                  <li>• <span className="font-semibold">Cookies de preferencias:</span> Para recordar tu configuración (tema, idioma)</li>
                  <li>• <span className="font-semibold">Cookies de seguridad:</span> Para prevenir ataques CSRF</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer del documento */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 md:p-10 border-t border-gray-200">
            <div className="text-center space-y-4">
              <p className="text-sm font-semibold text-gray-700">
                ¿Preguntas sobre privacidad o protección de datos?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <a 
                  href="mailto:privacidad@klinik-mat.cl"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <Mail className="w-4 h-4" />
                  <span>privacidad@klinik-mat.cl</span>
                </a>
                <a 
                  href="mailto:soporte@klinik-mat.cl"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-all shadow-md border border-blue-200"
                >
                  <Mail className="w-4 h-4" />
                  <span>soporte@klinik-mat.cl</span>
                </a>
              </div>
              <p className="text-xs text-gray-600 mt-4">
                Responsable del tratamiento de datos: KLINIK-MAT<br />
                Domicilio: Santiago, Chile
              </p>
            </div>
          </div>
        </div>

        {/* Botón de regreso */}
        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
