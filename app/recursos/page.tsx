// app/recursos/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Book,
  Calculator,
  Pill,
  Heart,
  FileText,
  Database,
  Stethoscope,
  Award,
  Gamepad2,
  Image as ImageIcon,
  Timer,
  Activity,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Recursos Clínicos',
  description: 'Herramientas, calculadoras y recursos para estudiantes de Obstetricia y Neonatología',
};

interface RecursoItem {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  color: string;
  badge?: string;
}

const recursos: RecursoItem[] = [
  {
    title: 'Timer Pomodoro',
    description: 'Técnica de estudio con intervalos de trabajo y descanso',
    href: '/pomodoro',
    icon: Timer,
    color: 'from-blue-500 to-blue-600',
    badge: 'Nuevo',
  },
  {
    title: 'Calculadoras Clínicas',
    description: 'FUM, IMC, edad gestacional, dosis de medicamentos',
    href: '/recursos/calculadoras',
    icon: Calculator,
    color: 'from-purple-500 to-purple-600',
  },
  {
    title: 'Anticonceptivos',
    description: 'Guías completas de métodos anticonceptivos',
    href: '/recursos/anticonceptivos',
    icon: Heart,
    color: 'from-pink-500 to-pink-600',
  },
  {
    title: 'Medicamentos',
    description: 'Vademécum de fármacos en obstetricia y neonatología',
    href: '/recursos/medicamentos',
    icon: Pill,
    color: 'from-green-500 to-green-600',
  },
  {
    title: 'Protocolos MINSAL',
    description: 'Guías clínicas del Ministerio de Salud',
    href: '/recursos/minsal',
    icon: FileText,
    color: 'from-blue-500 to-cyan-600',
  },
  {
    title: 'Protocolos de Urgencia',
    description: 'Algoritmos de atención de urgencias obstétricas',
    href: '/recursos/protocolos-urgencia',
    icon: Stethoscope,
    color: 'from-red-500 to-red-600',
  },
  {
    title: 'Escalas y Scores',
    description: 'Escalas de valoración clínica (Apgar, Bishop, etc.)',
    href: '/recursos/escalas-scores',
    icon: Award,
    color: 'from-yellow-500 to-orange-600',
  },
  {
    title: 'Atlas Visual',
    description: 'Imágenes y esquemas de anatomía obstétrica',
    href: '/recursos/atlas',
    icon: ImageIcon,
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    title: 'Simulador FCF',
    description: 'Interpreta patrones de frecuencia cardíaca fetal',
    href: '/recursos/simulador-fcf',
    icon: Activity,
    color: 'from-teal-500 to-teal-600',
  },
  {
    title: 'Bases de Datos',
    description: 'PubMed, Cochrane, Scielo y más',
    href: '/recursos/bases-datos',
    icon: Database,
    color: 'from-gray-600 to-gray-700',
  },
  {
    title: 'PubMed Search',
    description: 'Buscador integrado de artículos científicos',
    href: '/recursos/pubmed',
    icon: Book,
    color: 'from-blue-600 to-blue-700',
  },
  {
    title: 'Juegos Educativos',
    description: 'Sopa de letras, ahorcado y más',
    href: '/recursos/juegos/sopa-de-letras',
    icon: Gamepad2,
    color: 'from-fuchsia-500 to-fuchsia-600',
  },
];

export default function RecursosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--km-primary)] to-[var(--km-secondary)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6">
              Recursos Clínicos
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Herramientas, calculadoras y recursos especializados para tu formación en Obstetricia
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Recursos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {recursos.map((recurso) => {
            const Icon = recurso.icon;
            return (
              <Link
                key={recurso.href}
                href={recurso.href}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                {/* Badge */}
                {recurso.badge && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                      {recurso.badge}
                    </span>
                  </div>
                )}

                {/* Gradient Header */}
                <div className={`bg-gradient-to-r ${recurso.color} p-6 sm:p-8`}>
                  <Icon className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 group-hover:text-[var(--km-primary)] transition-colors">
                    {recurso.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    {recurso.description}
                  </p>

                  {/* Arrow */}
                  <div className="mt-4 flex items-center text-[var(--km-primary)] font-semibold text-sm">
                    <span>Abrir recurso</span>
                    <svg
                      className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 sm:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            ¿Necesitas más recursos?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Estamos agregando nuevas herramientas constantemente. Si necesitas algún recurso
            específico, envíanos tus sugerencias.
          </p>
          <Link
            href="/mi-perfil"
            className="inline-block bg-gradient-to-r from-[var(--km-primary)] to-[var(--km-secondary)] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            Contactar
          </Link>
        </div>
      </div>
    </div>
  );
}
