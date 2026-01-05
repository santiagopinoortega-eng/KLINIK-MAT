import Image from 'next/image';
import Link from 'next/link';

type LogoVariant = 'full' | 'icon' | 'text';
type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'hero' | 'xl';
type LogoTheme = 'light' | 'dark';

interface LogoProps {
  variant?: 'white' | 'red';
  size?: LogoSize;
  theme?: LogoTheme;
  href?: string | null;
  className?: string;
  showText?: boolean;
  priority?: boolean;
  withBackground?: boolean; // Nuevo: agregar fondo rojo
}

const sizeClasses = {
  xs: { height: 32, width: 64 },
  sm: { height: 45, width: 90 },
  md: { height: 55, width: 110 },
  lg: { height: 80, width: 160 },
  hero: { height: 100, width: 200 },
  xl: { height: 200, width: 400 },
};

export default function Logo({
  variant = 'white',
  size = 'md',
  theme = 'light',
  href,
  className = '',
  showText = true,
  priority = false,
  withBackground = false,
}: LogoProps) {
  const { height, width } = sizeClasses[size];

  const LogoContent = () => {
    const logoSrc = variant === 'red' ? '/brand/logo-centro-rojo.png' : '/brand/logo-centro.png';
    
    return (
      <div className={`flex items-center ${withBackground ? 'bg-gradient-to-br from-red-600 to-red-700 rounded-lg px-3 py-2 shadow-md' : ''}`}>
        <Image
          src={logoSrc}
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
  return <Logo variant="red" size="md" priority />;
}

export function LogoFooter() {
  return <Logo size="lg" href="/" />;
}

export function LogoSidebar() {
  return <Logo size="sm" withBackground />;
}

export function LogoHero() {
  return <Logo size="xl" href={null} priority className="drop-shadow-2xl" />;
}
