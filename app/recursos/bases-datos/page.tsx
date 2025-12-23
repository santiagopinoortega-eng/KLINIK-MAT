'use client';

import Link from 'next/link';
import { 
  GlobeAltIcon,
  ArrowLeftIcon,
  BookOpenIcon,
  AcademicCapIcon,
  BeakerIcon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';

interface DatabaseLink {
  name: string;
  description: string;
  url: string;
  icon: any;
  bgGradient: string;
  category: string;
}

const databases: DatabaseLink[] = [
  // Bases de Datos Internacionales
  {
    name: 'PubMed / MEDLINE',
    description: 'Base de datos biomédica más grande del mundo con más de 35 millones de artículos. Acceso a literatura científica actualizada en obstetricia y ginecología.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/',
    icon: BeakerIcon,
    bgGradient: 'from-blue-600 to-cyan-600',
    category: 'Base de Datos'
  },
  {
    name: 'Cochrane Library',
    description: 'Revisiones sistemáticas y metaanálisis de alta calidad sobre intervenciones en salud. Referencia gold standard en medicina basada en evidencia.',
    url: 'https://www.cochranelibrary.com/',
    icon: BookOpenIcon,
    bgGradient: 'from-green-600 to-emerald-600',
    category: 'Revisiones Sistemáticas'
  },
  {
    name: 'UpToDate',
    description: 'Recurso de decisión clínica basado en evidencia. Recomendaciones actualizadas para el manejo de condiciones obstétricas y ginecológicas.',
    url: 'https://www.uptodate.com/',
    icon: DocumentTextIcon,
    bgGradient: 'from-indigo-600 to-purple-600',
    category: 'Decisión Clínica'
  },

  // Sociedades Científicas Internacionales
  {
    name: 'ACOG - American College of Obstetricians and Gynecologists',
    description: 'Guías de práctica clínica, boletines de práctica y opiniones de comité de la sociedad estadounidense de obstetricia y ginecología.',
    url: 'https://www.acog.org/',
    icon: AcademicCapIcon,
    bgGradient: 'from-red-600 to-rose-600',
    category: 'Sociedad Científica'
  },
  {
    name: 'RCOG - Royal College of Obstetricians and Gynaecologists',
    description: 'Guías clínicas (Green-top Guidelines) del colegio británico. Estándares de práctica basados en evidencia del Reino Unido.',
    url: 'https://www.rcog.org.uk/',
    icon: AcademicCapIcon,
    bgGradient: 'from-purple-600 to-violet-600',
    category: 'Sociedad Científica'
  },
  {
    name: 'FIGO - International Federation of Gynecology and Obstetrics',
    description: 'Federación internacional de obstetricia y ginecología. Guías y consensos internacionales en salud reproductiva.',
    url: 'https://www.figo.org/',
    icon: GlobeAltIcon,
    bgGradient: 'from-teal-600 to-cyan-600',
    category: 'Organización Internacional'
  },
  {
    name: 'SMFM - Society for Maternal-Fetal Medicine',
    description: 'Sociedad de medicina materno-fetal. Guías y recomendaciones para embarazos de alto riesgo y medicina fetal.',
    url: 'https://www.smfm.org/',
    icon: AcademicCapIcon,
    bgGradient: 'from-orange-600 to-red-600',
    category: 'Sociedad Científica'
  },

  // Organismos Internacionales
  {
    name: 'WHO - World Health Organization (OMS)',
    description: 'Organización Mundial de la Salud. Guías internacionales de salud reproductiva, materna y neonatal.',
    url: 'https://www.who.int/health-topics/maternal-health',
    icon: GlobeAltIcon,
    bgGradient: 'from-blue-500 to-sky-600',
    category: 'Organización Internacional'
  },

  // Latinoamérica
  {
    name: 'FLASOG - Federación Latinoamericana de Obstetricia y Ginecología',
    description: 'Federación que agrupa sociedades de obstetricia y ginecología de América Latina. Guías regionales y consensos.',
    url: 'https://flasog.org/',
    icon: GlobeAltIcon,
    bgGradient: 'from-yellow-600 to-orange-600',
    category: 'Organización Regional'
  },
  {
    name: 'SOCHOG - Sociedad Chilena de Obstetricia y Ginecología',
    description: 'Sociedad científica chilena. Guías nacionales, consensos y actualizaciones en obstetricia y ginecología para Chile.',
    url: 'https://www.sochog.cl/',
    icon: AcademicCapIcon,
    bgGradient: 'from-red-600 to-blue-600',
    category: 'Sociedad Nacional'
  },

  // Revistas Científicas de Alto Impacto
  {
    name: 'The Lancet',
    description: 'Una de las revistas médicas más prestigiosas del mundo. Artículos de investigación original y revisiones en todas las áreas médicas.',
    url: 'https://www.thelancet.com/',
    icon: BookOpenIcon,
    bgGradient: 'from-slate-700 to-gray-800',
    category: 'Revista Científica'
  },
  {
    name: 'New England Journal of Medicine (NEJM)',
    description: 'Revista médica de mayor impacto mundial. Investigación clínica de vanguardia y guías de práctica.',
    url: 'https://www.nejm.org/',
    icon: BookOpenIcon,
    bgGradient: 'from-red-700 to-rose-800',
    category: 'Revista Científica'
  },
  {
    name: 'Obstetrics & Gynecology (The Green Journal)',
    description: 'Revista oficial de ACOG. Investigación clínica y básica en obstetricia, ginecología y salud reproductiva.',
    url: 'https://journals.lww.com/greenjournal/',
    icon: BookOpenIcon,
    bgGradient: 'from-green-700 to-emerald-800',
    category: 'Revista Especializada'
  },
  {
    name: 'American Journal of Obstetrics & Gynecology (AJOG)',
    description: 'Revista líder en investigación obstétrica y ginecológica. Artículos originales, revisiones y guías clínicas.',
    url: 'https://www.ajog.org/',
    icon: BookOpenIcon,
    bgGradient: 'from-blue-700 to-indigo-800',
    category: 'Revista Especializada'
  },
  {
    name: 'BJOG: An International Journal',
    description: 'Revista internacional del RCOG. Investigación clínica y básica en obstetricia, ginecología y salud reproductiva.',
    url: 'https://obgyn.onlinelibrary.wiley.com/journal/14710528',
    icon: BookOpenIcon,
    bgGradient: 'from-purple-700 to-violet-800',
    category: 'Revista Especializada'
  },

  // Recursos Chile
  {
    name: 'MINSAL - Guías Clínicas Chile',
    description: 'Ministerio de Salud de Chile. Guías clínicas oficiales, normativas y protocolos nacionales de salud materna.',
    url: 'https://www.minsal.cl/guias-clinicas/',
    icon: DocumentTextIcon,
    bgGradient: 'from-red-600 to-blue-600',
    category: 'Autoridad Nacional'
  },
];

export default function BasesDatosPage() {
  const categories = Array.from(new Set(databases.map(db => db.category)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/areas"
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Volver a Áreas
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
              <GlobeAltIcon className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Bases de Datos <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Científicas</span>
              </h1>
              <p className="text-gray-600 mt-1">Recursos de evidencia actualizada en obstetricia y ginecología</p>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <GlobeAltIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Bases de Datos</p>
                <p className="text-3xl font-bold text-gray-900">{databases.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <AcademicCapIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Sociedades Científicas</p>
                <p className="text-3xl font-bold text-gray-900">5</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <BookOpenIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Revistas Especializadas</p>
                <p className="text-3xl font-bold text-gray-900">5</p>
              </div>
            </div>
          </div>
        </div>

        {/* Categorías y Bases de Datos */}
        <div className="space-y-8">
          {categories.map(category => {
            const categoryDbs = databases.filter(db => db.category === category);
            return (
              <div key={category}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-8 bg-gradient-to-b from-teal-600 to-cyan-600 rounded-full"></div>
                  {category}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categoryDbs.map((db) => {
                    const Icon = db.icon;
                    return (
                      <a
                        key={db.name}
                        href={db.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 hover:border-teal-300 hover:shadow-xl transition-all hover:-translate-y-1"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br ${db.bgGradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="text-lg font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
                                {db.name}
                              </h3>
                              <ArrowTopRightOnSquareIcon className="w-5 h-5 text-gray-400 group-hover:text-teal-600 flex-shrink-0 transition-colors" />
                            </div>
                            
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {db.description}
                            </p>
                            
                            <div className="mt-3 flex items-center gap-2 text-teal-600 font-semibold text-sm">
                              <span>Visitar sitio</span>
                              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div className="mt-12 bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 rounded-2xl p-8 md:p-10 shadow-2xl">
          <div className="text-center text-white">
            <BookOpenIcon className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Medicina Basada en Evidencia
            </h2>
            <p className="text-xl opacity-90 mb-2 max-w-3xl mx-auto leading-relaxed">
              Estos recursos representan las fuentes de información médica más actualizadas y confiables en obstetricia y ginecología.
            </p>
            <p className="text-lg opacity-80 max-w-2xl mx-auto">
              Utilízalos para fundamentar decisiones clínicas y mantenerte actualizado con la evidencia científica más reciente.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
