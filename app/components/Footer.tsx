/**
 * Footer component - KLINIK-MAT
 * Copyright y links útiles
 */

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-km-crimson/10 bg-gradient-to-b from-km-cream to-km-blush">
      <div className="container-app py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Columna 1: Logo y descripción */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-km-cardinal">KLINIK-MAT</h3>
            <p className="text-sm text-km-text-700 leading-relaxed">
              Plataforma de casos clínicos para estudiantes de Obstetricia en Chile.
            </p>
          </div>

          {/* Columna 2: Enlaces rápidos */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-km-navy uppercase tracking-wider">Enlaces</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/casos" className="text-km-text-700 hover:text-km-crimson transition-colors">
                  Casos Clínicos
                </a>
              </li>
              <li>
                <a href="/recursos" className="text-km-text-700 hover:text-km-crimson transition-colors">
                  Recursos
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Información */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-km-navy uppercase tracking-wider">Información</h4>
            <p className="text-sm text-km-text-700">
              Desarrollado para estudiantes de Obstetricia y Matronería.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-km-crimson/10">
          <p className="text-center text-sm text-km-text-700">
            © {currentYear} KLINIK-MAT. <strong className="text-km-crimson">Todos los derechos reservados.</strong>
          </p>
        </div>
      </div>
    </footer>
  );
}
