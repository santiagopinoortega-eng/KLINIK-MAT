/**
 * Ícono SVG de útero - Símbolo de la obstetricia chilena
 * Diseño minimalista y médico
 */

interface UterusIconProps {
  className?: string;
  size?: number;
  color?: string;
}

export default function UterusIcon({ 
  className = '', 
  size = 24, 
  color = 'currentColor' 
}: UterusIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Cuerpo del útero */}
      <path
        d="M12 3C9.5 3 7.5 5 7.5 7.5V12C7.5 14.5 9.5 16.5 12 16.5C14.5 16.5 16.5 14.5 16.5 12V7.5C16.5 5 14.5 3 12 3Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Cuello uterino */}
      <path
        d="M12 16.5V21"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      
      {/* Trompa izquierda */}
      <path
        d="M7.5 8C6 8 4.5 7 3.5 6C2.5 5 2 4 2 3"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Ovario izquierdo */}
      <circle
        cx="2.5"
        cy="3.5"
        r="1.5"
        fill={color}
        opacity="0.3"
      />
      
      {/* Trompa derecha */}
      <path
        d="M16.5 8C18 8 19.5 7 20.5 6C21.5 5 22 4 22 3"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Ovario derecho */}
      <circle
        cx="21.5"
        cy="3.5"
        r="1.5"
        fill={color}
        opacity="0.3"
      />
    </svg>
  );
}
