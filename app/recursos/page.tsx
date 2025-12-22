// app/recursos/page.tsx
import Link from 'next/link';
import {
  BookOpenIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  BeakerIcon,
  HeartIcon,
  ClipboardDocumentCheckIcon,
  VideoCameraIcon,
  GlobeAltIcon,
  UserGroupIcon,
  CalculatorIcon,
  ChartBarIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const recursosDestacados = [
  {
    title: 'Guía Rápida de Anticonceptivos',
    description: 'Guía interactiva completa con criterios de elegibilidad OMS, efectividad, contraindicaciones y recomendaciones para cada método anticonceptivo.',
    href: '/recursos/anticonceptivos',
    icon: HeartIcon,
    bgGradient: 'from-rose-500 to-pink-600',
    badge: 'Interactivo',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  {
    title: 'Normativas MINSAL',
    description: 'Acceso directo a guías clínicas, protocolos oficiales y normativas del Ministerio de Salud de Chile sobre salud sexual y reproductiva.',
    href: '/recursos/minsal',
    icon: DocumentTextIcon,
    bgGradient: 'from-blue-500 to-cyan-600',
    badge: 'Oficial',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
  },
];

const recursosAdicionales = [
  {
    title: 'Calculadoras Obstétricas',
    description: 'Calcula edad gestacional, fecha probable de parto, IMC pregestacional, ganancia de peso ideal y más.',
    icon: CalculatorIcon,
    bgGradient: 'from-purple-500 to-violet-600',
    badge: 'Próximamente',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    title: 'Atlas de Ecografía',
    description: 'Imágenes de referencia ecográfica obstétrica con descripciones detalladas de hallazgos normales y patológicos.',
    icon: BeakerIcon,
    bgGradient: 'from-green-500 to-emerald-600',
    badge: 'Próximamente',
    badgeColor: 'bg-green-100 text-green-800 border-green-200',
  },
  {
    title: 'Protocolos de Urgencia',
    description: 'Algoritmos de manejo para emergencias obstétricas: hemorragia postparto, eclampsia, sufrimiento fetal.',
    icon: ClipboardDocumentCheckIcon,
    bgGradient: 'from-red-500 to-orange-600',
    badge: 'Próximamente',
    badgeColor: 'bg-red-100 text-red-800 border-red-200',
  },
  {
    title: 'Videos Educativos',
    description: 'Biblioteca de videos sobre técnicas de exploración física, procedimientos y casos clínicos comentados.',
    icon: VideoCameraIcon,
    bgGradient: 'from-indigo-500 to-blue-600',
    badge: 'Próximamente',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  {
    title: 'Escalas y Scores',
    description: 'Acceso rápido a escalas de valoración: Bishop, Apgar, Ballard, riesgo biopsicosocial y más.',
    icon: ChartBarIcon,
    bgGradient: 'from-yellow-500 to-amber-600',
    badge: 'Próximamente',
    badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  {
    title: 'Bases de Datos Científicas',
    description: 'Enlaces directos a PubMed, Cochrane, RCOG, ACOG y otras fuentes de evidencia científica actualizada.',
    icon: GlobeAltIcon,
    bgGradient: 'from-teal-500 to-cyan-600',
    badge: 'Próximamente',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
  },
];

const estadisticas = [
  { label: 'Recursos Disponibles', value: '2', icon: BookOpenIcon },
  { label: 'Guías Oficiales', value: '15+', icon: DocumentTextIcon },
  { label: 'Métodos Anticonceptivos', value: '12', icon: HeartIcon },
];

export default function RecursosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/20 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-600 to-rose-600 rounded-2xl shadow-lg mb-6">
            <BookOpenIcon className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Centro de <span className="bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">Recursos</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Herramientas, guías y recursos de referencia para potenciar tu aprendizaje en obstetricia y salud reproductiva
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {estadisticas.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recursos Destacados */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
              <AcademicCapIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Recursos Destacados</h2>
              <p className="text-gray-600">Herramientas disponibles ahora</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {recursosDestacados.map((recurso) => {
              const Icon = recurso.icon;
              return (
                <Link 
                  key={recurso.title} 
                  href={recurso.href} 
                  className="group block"
                >
                  <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-100 h-full transition-all duration-300 group-hover:shadow-2xl group-hover:border-red-200 group-hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br ${recurso.bgGradient} shadow-lg`}>
                        <Icon className="w-9 h-9 text-white" />
                      </div>
                      <span className={`px-4 py-1.5 rounded-xl text-xs font-bold border-2 ${recurso.badgeColor}`}>
                        {recurso.badge}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                      {recurso.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {recurso.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-red-600 font-bold group-hover:gap-3 transition-all">
                      <span>Explorar recurso</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Próximamente */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
              <UserGroupIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Próximos Recursos</h2>
              <p className="text-gray-600">Herramientas en desarrollo</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recursosAdicionales.map((recurso) => {
              const Icon = recurso.icon;
              return (
                <div 
                  key={recurso.title} 
                  className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 opacity-75 cursor-not-allowed"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br ${recurso.bgGradient} shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border-2 ${recurso.badgeColor}`}>
                      {recurso.badge}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {recurso.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {recurso.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-2xl p-8 md:p-12 shadow-2xl">
          <div className="text-center text-white">
            <ShieldCheckIcon className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Tienes sugerencias?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Estamos constantemente mejorando nuestros recursos. Si hay alguna herramienta o guía que te gustaría ver aquí, háznoslo saber.
            </p>
            <Link 
              href="/mi-perfil" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-red-600 font-bold rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl"
            >
              <UserGroupIcon className="w-6 h-6" />
              Contactar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
