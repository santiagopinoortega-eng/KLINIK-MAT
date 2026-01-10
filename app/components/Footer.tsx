/**
 * Footer component - KLINIK-MAT
 * Footer completo con información de contacto, enlaces y disclaimer médico
 */

import Logo from './Logo';
import { 
  Instagram, 
  Linkedin, 
  Mail, 
  MessageCircle, 
  Building2,
  ChevronRight,
  FileText,
  Lock,
  Info,
  HelpCircle
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-gradient-to-br from-red-700 via-red-800 to-red-900 text-white">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Columna 1: Logo y descripción */}
          <div className="space-y-6">
            <div className="inline-block transform hover:scale-105 transition-transform">
              <Logo size="lg" href="/" className="filter brightness-110" />
            </div>
            <p className="text-sm text-white/95 leading-relaxed font-light max-w-xs">
              Plataforma educativa de casos clínicos para estudiantes de obstetricia en Chile.
            </p>
            <div className="flex gap-3 pt-2">
              {/* Redes sociales */}
              <a 
                href="#" 
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white hover:text-red-700 text-white flex items-center justify-center transition-all hover-lift"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white hover:text-red-700 text-white flex items-center justify-center transition-all hover-lift"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Columna 2: Navegación */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Navegación</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-white hover:text-white transition-colors flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  Inicio
                </a>
              </li>
              <li>
                <a href="/casos" className="text-white hover:text-white transition-colors flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  Casos Clínicos
                </a>
              </li>
              <li>
                <a href="/areas" className="text-white hover:text-white transition-colors flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  Áreas y Recursos
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Legal y Soporte */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Información Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/terminos" className="text-white hover:text-white transition-colors flex items-center gap-2 group">
                  <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Términos de Uso
                </a>
              </li>
              <li>
                <a href="/privacidad" className="text-white hover:text-white transition-colors flex items-center gap-2 group">
                  <Lock className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="text-white hover:text-white transition-colors flex items-center gap-2 group">
                  <Info className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Acerca de
                </a>
              </li>
              <li>
                <a href="#" className="text-white hover:text-white transition-colors flex items-center gap-2 group">
                  <HelpCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Preguntas Frecuentes
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Contacto</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">Email</p>
                  <a 
                    href="mailto:klinik.mat2025@gmail.com" 
                    className="text-white/90 hover:text-white transition-colors break-all"
                  >
                    klinik.mat2025@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageCircle className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">Soporte</p>
                  <a 
                    href="mailto:soporte.klinik.mat@gmail.com" 
                    className="text-white/90 hover:text-white transition-colors break-all"
                  >
                    soporte.klinik.mat@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">Colaboraciones</p>
                  <a 
                    href="mailto:klinik.mat2025@gmail.com" 
                    className="text-white/90 hover:text-white transition-colors break-all"
                  >
                    klinik.mat2025@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright y Créditos */}
        <div className="pt-8 border-t border-white/20">
          <div className="text-center text-sm text-white">
            <p>
              © {currentYear} <strong>KLINIK-MAT</strong>. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
