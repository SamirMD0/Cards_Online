import { useState } from 'react';

const CARD_COLORS = {
  red: '#e53e3e',
  blue: '#3182ce',
  green: '#38a169',
  yellow: '#d69e2e',
  wild: '#2d3748'
};

const CARD_ICONS = {
  skip: '🚫',
  reverse: '↩️',
  draw2: '+2',
  wild: '🌈',
  wild_draw4: '🌈+4'
};

export default function Card({ card, onClick, disabled = false, size = 'normal' }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const backgroundColor = CARD_COLORS[card.color] || '#ddd';
  const isWild = card.color === 'wild';
  const isActionCard = ['skip', 'reverse', 'draw2', 'wild_draw4'].includes(card.value);
  
  // Size configurations
  const sizes = {
    small: { width: 60, height: 90, fontSize: 16 },
    normal: { width: 80, height: 120, fontSize: 20 },
    large: { width: 100, height: 150, fontSize: 24 }
  };
  
  const { width, height, fontSize } = sizes[size] || sizes.normal;
  
  const getDisplayValue = () => {
    if (CARD_ICONS[card.value]) {
      return CARD_ICONS[card.value];
    }
    return card.value;
  };
  
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: width,
        height: height,
        background: isWild 
          ? 'linear-gradient(135deg, #e53e3e 0%, #3182ce 25%, #38a169 50%, #d69e2e 75%, #e53e3e 100%)'
          : backgroundColor,
        border: '3px solid white',
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: isHovered && !disabled
          ? '0 8px 20px rgba(0,0,0,0.4)'
          : '0 4px 8px rgba(0,0,0,0.2)',
        opacity: disabled ? 0.6 : 1,
        transform: isHovered && !disabled ? 'translateY(-10px) scale(1.05)' : 'translateY(0)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Card inner white area */}
      <div style={{
        background: 'white',
        width: width * 0.75,
        height: height * 0.7,
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: fontSize,
        fontWeight: 'bold',
        color: backgroundColor,
        position: 'relative',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {/* Top corner indicator */}
        <div style={{
          position: 'absolute',
          top: 4,
          left: 4,
          fontSize: fontSize * 0.5,
          fontWeight: 'bold',
          color: backgroundColor
        }}>
          {getDisplayValue()}
        </div>
        
        {/* Center value */}
        <div style={{
          fontSize: isActionCard ? fontSize * 1.2 : fontSize * 1.5,
          textTransform: 'uppercase'
        }}>
          {getDisplayValue()}
        </div>
        
        {/* Bottom corner indicator */}
        <div style={{
          position: 'absolute',
          bottom: 4,
          right: 4,
          fontSize: fontSize * 0.5,
          fontWeight: 'bold',
          color: backgroundColor,
          transform: 'rotate(180deg)'
        }}>
          {getDisplayValue()}
        </div>
      </div>
      
      {/* Shine effect on hover */}
      {isHovered && !disabled && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          animation: 'shine 0.6s'
        }} />
      )}
      
      <style>{`
        @keyframes shine {
          to { left: 100%; }
        }
      `}</style>
    </div>
  );
}