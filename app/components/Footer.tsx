/**
 * Footer component - KLINIK-MAT
 * Footer completo con información de contacto, enlaces y disclaimer médico
 */

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-km-crimson/10 bg-gradient-to-b from-km-cream to-km-blush">
      <div className="container-app py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Columna 1: Logo y descripción */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-km-cardinal" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>KLINIK-MAT</h3>
            <p className="text-sm text-km-text-700 leading-relaxed">
              Plataforma educativa de casos clínicos para estudiantes de Obstetricia y Matronería en Chile.
            </p>
            <div className="flex gap-3 pt-2">
              {/* Redes sociales - placeholder */}
              <a 
                href="#" 
                className="w-9 h-9 rounded-full bg-km-crimson/10 hover:bg-km-crimson hover:text-white text-km-crimson flex items-center justify-center transition-all hover-lift"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a 
                href="#" 
                className="w-9 h-9 rounded-full bg-km-crimson/10 hover:bg-km-crimson hover:text-white text-km-crimson flex items-center justify-center transition-all hover-lift"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>

          {/* Columna 2: Navegación */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-km-navy uppercase tracking-wider">Navegación</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-km-text-700 hover:text-km-crimson transition-colors flex items-center gap-2">
                  <span>→</span> Inicio
                </a>
              </li>
              <li>
                <a href="/casos" className="text-km-text-700 hover:text-km-crimson transition-colors flex items-center gap-2">
                  <span>→</span> Casos Clínicos
                </a>
              </li>
              <li>
                <a href="/recursos" className="text-km-text-700 hover:text-km-crimson transition-colors flex items-center gap-2">
                  <span>→</span> Recursos MINSAL
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Legal y Soporte */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-km-navy uppercase tracking-wider">Información Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-km-text-700 hover:text-km-crimson transition-colors flex items-center gap-2">
                  <span>📄</span> Términos de Uso
                </a>
              </li>
              <li>
                <a href="#" className="text-km-text-700 hover:text-km-crimson transition-colors flex items-center gap-2">
                  <span>🔒</span> Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="text-km-text-700 hover:text-km-crimson transition-colors flex items-center gap-2">
                  <span>ℹ️</span> Acerca de
                </a>
              </li>
              <li>
                <a href="#" className="text-km-text-700 hover:text-km-crimson transition-colors flex items-center gap-2">
                  <span>❓</span> Preguntas Frecuentes
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-km-navy uppercase tracking-wider">Contacto</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-km-crimson mt-0.5">✉️</span>
                <div>
                  <p className="font-semibold text-km-navy">Email</p>
                  <a 
                    href="mailto:contacto@klinik-mat.cl" 
                    className="text-km-text-700 hover:text-km-crimson transition-colors break-all"
                  >
                    contacto@klinik-mat.cl
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-km-crimson mt-0.5">💬</span>
                <div>
                  <p className="font-semibold text-km-navy">Soporte</p>
                  <a 
                    href="mailto:soporte@klinik-mat.cl" 
                    className="text-km-text-700 hover:text-km-crimson transition-colors break-all"
                  >
                    soporte@klinik-mat.cl
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-km-crimson mt-0.5">🏥</span>
                <div>
                  <p className="font-semibold text-km-navy">Colaboraciones</p>
                  <a 
                    href="mailto:colaboraciones@klinik-mat.cl" 
                    className="text-km-text-700 hover:text-km-crimson transition-colors break-all"
                  >
                    colaboraciones@klinik-mat.cl
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer Médico - Obligatorio en sitios de salud */}
        <div className="bg-km-rose/5 border border-km-crimson/20 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="space-y-2">
              <h5 className="font-bold text-km-cardinal text-sm">Aviso Importante - Uso Educativo</h5>
              <p className="text-xs text-km-text-700 leading-relaxed">
                <strong>KLINIK-MAT es una plataforma educativa.</strong> Los casos clínicos presentados son simulaciones con fines de aprendizaje y no sustituyen la formación clínica supervisada, el juicio profesional, ni las guías clínicas oficiales del MINSAL. 
                <strong className="text-km-crimson"> No utilizar como única fuente para decisiones clínicas reales.</strong> Siempre consulta la normativa vigente y a profesionales capacitados.
              </p>
            </div>
          </div>
        </div>

        {/* Copyright y Créditos */}
        <div className="pt-8 border-t border-km-crimson/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-km-text-700">
            <p className="text-center md:text-left">
              © {currentYear} <strong className="text-km-crimson">KLINIK-MAT</strong>. Todos los derechos reservados.
            </p>
            <p className="text-center md:text-right text-xs">
              Desarrollado con ❤️ para estudiantes de Obstetricia y Matronería de Chile
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
