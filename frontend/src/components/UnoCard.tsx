import { useState } from 'react';

export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'wild';
export type CardValue = string | number;

interface UnoCardProps {
  color: CardColor;
  value: CardValue;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const colorMap = {
  red: 'bg-uno-red shadow-glow-red',
  blue: 'bg-uno-blue shadow-glow-blue',
  green: 'bg-uno-green shadow-glow-green',
  yellow: 'bg-uno-yellow shadow-glow-yellow',
  wild: 'bg-gradient-to-br from-uno-red via-uno-blue to-uno-green',
};

const colorRing = {
  red: 'ring-uno-red',
  blue: 'ring-uno-blue',
  green: 'ring-uno-green',
  yellow: 'ring-uno-yellow',
  wild: 'ring-white',
};

export default function UnoCard({
  color,
  value,
  onClick,
  disabled = false,
  className = '',
}: UnoCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const cardColorClass = colorMap[color];
  const cardRingClass = colorRing[color];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative w-24 h-36 rounded-2xl border-4 border-white
        ${cardColorClass}
        transition-all duration-300 
        ${
          !disabled && isHovered
            ? 'transform -translate-y-4 scale-110 shadow-card-hover rotate-0'
            : 'shadow-card'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:ring-4'}
        ${!disabled && isHovered ? cardRingClass : ''}
        ${className}
      `}
    >
      {/* Card Inner Content */}
      <div className="absolute inset-3 bg-white rounded-lg flex flex-col items-center justify-center">
        {/* Top Corner Value */}
        <div className={`absolute top-1 left-1 text-lg font-bold ${color === 'wild' ? 'text-uno-wild' : `text-uno-${color}`}`}>
          {value}
        </div>

        {/* Center Value */}
        <div className={`text-5xl font-extrabold font-poppins ${color === 'wild' ? 'text-uno-wild' : `text-uno-${color}`}`}>
          {value}
        </div>

        {/* Bottom Corner Value (Rotated) */}
        <div 
          className={`absolute bottom-1 right-1 text-lg font-bold transform rotate-180 ${color === 'wild' ? 'text-uno-wild' : `text-uno-${color}`}`}
        >
          {value}
        </div>
      </div>

      {/* Shine Effect on Hover */}
      {isHovered && !disabled && (
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-2xl animate-shimmer" />
      )}
    </button>
  );
}