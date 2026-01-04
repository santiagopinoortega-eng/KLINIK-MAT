import Image from 'next/image';
import Link from 'next/link';

type LogoVariant = 'full' | 'icon' | 'text';
type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type LogoTheme = 'light' | 'dark';

interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  theme?: LogoTheme;
  href?: string | null;
  className?: string;
  showText?: boolean;
  priority?: boolean;
}

const sizeClasses = {
  xs: { height: 20, width: 38 },   // Proporción ~2:1 para logo horizontal
  sm: { height: 28, width: 53 },
  md: { height: 36, width: 68 },
  lg: { height: 48, width: 91 },
  xl: { height: 72, width: 137 },
};

export default function Logo({
  variant = 'full',
  size = 'md',
  theme = 'light',
  href,
  className = '',
  showText = true,
  priority = false,
}: LogoProps) {
  const { height, width } = sizeClasses[size];

  const LogoContent = () => {
    // Para este logo, la imagen ya contiene el texto y el símbolo
    // Por lo tanto, siempre mostramos la imagen completa
    return (
      <div className="flex items-center">
        <Image
          src="/brand/logo-centro.png"
          alt="KLINIK-MAT - Plataforma de casos clínicos de obstetricia"
          width={width}
          height={height}
          className="object-contain w-auto h-full"
          priority={priority}
          quality={95}
        />
      </div>
    );
  };

  // Si href es undefined, usar '/' por defecto. Si es null, no hacer link.
  const shouldLink = href !== null;
  const linkHref = href === null ? '' : (href || '/');

  if (shouldLink) {
    return (
      <Link 
        href={linkHref} 
        className={`inline-flex items-center transition-all hover:opacity-90 hover:scale-[1.02] ${className}`}
        aria-label="KLINIK-MAT - Ir a página principal"
      >
        <LogoContent />
      </Link>
    );
  }

  return (
    <div className={`inline-flex items-center ${className}`}>
      <LogoContent />
    </div>
  );
}

// Componentes especializados para casos comunes
export function LogoHeader() {
  return <Logo size="sm" priority />;
}

export function LogoFooter() {
  return <Logo size="md" href="/" />;
}

export function LogoSidebar() {
  return <Logo size="sm" />;
}

export function LogoHero() {
  return <Logo size="xl" href={null} priority className="drop-shadow-2xl" />;
}
