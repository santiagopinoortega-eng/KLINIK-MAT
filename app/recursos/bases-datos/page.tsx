import Link from 'next/link';
import { 
  ArrowLeftIcon,
  BookOpenIcon,
  AcademicCapIcon,
  BeakerIcon,
  DocumentTextIcon,
  GlobeAltIcon,
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
      {/* Header con botón de retorno */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Link 
            href="/areas"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="font-medium">Volver a Áreas</span>
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              Bases de Datos Científicas
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
              Recursos de evidencia actualizada en obstetricia, ginecología y neonatología
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Bases de Datos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {databases.map((db) => {
            const Icon = db.icon;
            return (
              <a
                key={db.name}
                href={db.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="
                  relative h-full bg-gradient-to-br from-red-600 to-red-700
                  rounded-xl p-6 
                  transition-all duration-300 
                  hover:scale-105 hover:shadow-2xl hover:shadow-red-200/50
                  border border-red-500
                ">
                  {/* Icono */}
                  <div className="mb-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Título */}
                  <h3 className="text-lg font-bold text-white leading-tight mb-2">
                    {db.name}
                  </h3>

                  {/* Categoría */}
                  <div className="text-xs text-white/80 font-medium mb-3">
                    📚 {db.category}
                  </div>

                  {/* Descripción */}
                  <p className="text-sm text-white/90 leading-relaxed line-clamp-3 mb-4">
                    {db.description}
                  </p>

                  {/* Arrow en hover */}
                  <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg 
                      className="w-5 h-5 text-white transform group-hover:translate-x-1 transition-transform"
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>

                  {/* Decoración */}
                  <div className="absolute bottom-0 right-0 w-20 h-20 bg-white/10 rounded-tl-full" />
                </div>
              </a>
            );
          })}
        </div>

        {/* Footer informativo */}
        <div className="mt-12 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-center text-sm text-gray-600 mb-2">
            📚 <strong>Medicina Basada en Evidencia:</strong> Estos recursos representan las fuentes de información médica más actualizadas y confiables en obstetricia y ginecología.
          </p>
          <p className="text-center text-xs text-gray-500">
            Utilízalos para fundamentar decisiones clínicas y mantenerte actualizado con la evidencia científica más reciente.
          </p>
        </div>
      </div>
    </div>
  );
}
