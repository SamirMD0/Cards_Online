import { useState } from 'react';
import styled from 'styled-components';
import ChooseColorCard from './ChooseColorCard';
import ReverseCard from './ReverseCard';
import Draw2Card from './Draw2';
import Draw4Card from './Draw4';
import SkipCard from './SkipCard';

export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'wild';
export type CardValue = string | number;
export type CardSize = 'xs' | 'sm' | 'md' | 'lg';

export interface UnoCardProps {
  color: CardColor;
  value: CardValue;
  faceUp?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  size?: CardSize;
}

const colorMap: Record<CardColor, string> = {
  red: '#cb0323',
  blue: '#0055ff',
  green: '#1fa64a',
  yellow: '#f2c400',
  wild: '#111',
};

const sizeMap = {
  xs: { width: '30px', height: '46px', fontSize: '0.5rem', centerSize: '1rem', radius: '4px' },
  sm: { width: '60px', height: '90px', fontSize: '0.75rem', centerSize: '1.5rem', radius: '6px' },
  md: { width: '100px', height: '150px', fontSize: '1rem', centerSize: '2.5rem', radius: '10px' },
  lg: { width: '140px', height: '220px', fontSize: '1.25rem', centerSize: '3.5rem', radius: '16px' },
};

export default function UnoCard({
  color,
  value,
  faceUp = true,
  onClick,
  disabled = false,
  className = '',
  size = 'md',
}: UnoCardProps) {
  const [hovered, setHovered] = useState(false);

  // Route to specialized components when face-up
  if (faceUp) {
    const valueStr = String(value).toLowerCase();
    
    // Wild Draw 4 (wild color + wild_draw4 value)
    if (color === 'wild' && valueStr === 'wild_draw4') {
      return (
        <CardWrapper
          className={className}
          onClick={!disabled ? onClick : undefined}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          $hovered={hovered}
          $disabled={disabled}
          $size={size}
        >
          <Draw4Card />
        </CardWrapper>
      );
    }

    // Wild Choose Color (wild color + wild value)
    if (color === 'wild' && valueStr === 'wild') {
      return (
        <CardWrapper
          className={className}
          onClick={!disabled ? onClick : undefined}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          $hovered={hovered}
          $disabled={disabled}
          $size={size}
        >
          <ChooseColorCard />
        </CardWrapper>
      );
    }

    // Draw 2 (colored card with draw2 value)
    if (valueStr === 'draw2') {
      return (
        <CardWrapper
          className={className}
          onClick={!disabled ? onClick : undefined}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          $hovered={hovered}
          $disabled={disabled}
          $size={size}
        >
          <Draw2Card color={color as 'red' | 'blue' | 'green' | 'yellow'} />
        </CardWrapper>
      );
    }

    // Skip (colored card with skip value)
    if (valueStr === 'skip') {
      return (
        <CardWrapper
          className={className}
          onClick={!disabled ? onClick : undefined}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          $hovered={hovered}
          $disabled={disabled}
          $size={size}
        >
          <SkipCard color={color as 'red' | 'blue' | 'green' | 'yellow'} />
        </CardWrapper>
      );
    }

    // Reverse (colored card with reverse value)
    if (valueStr === 'reverse') {
      return (
        <CardWrapper
          className={className}
          onClick={!disabled ? onClick : undefined}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          $hovered={hovered}
          $disabled={disabled}
          $size={size}
        >
          <ReverseCard color={color as 'red' | 'blue' | 'green' | 'yellow'} />
        </CardWrapper>
      );
    }
  }

  // Default rendering for number cards, back, and other types
  return (
    <Wrapper
      className={className}
      onClick={!disabled ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      $hovered={hovered}
      $disabled={disabled}
      $faceUp={faceUp}
      $size={size}
    >
      <div className="card">
        {/* BACK */}
        <div className="back">
          <div className="oval" />
          <div className="uno-text">UNO</div>
        </div>

        {/* FRONT */}
        <div className="front" style={{ background: colorMap[color] }}>
          <div className="oval border" />
          <div className="text top">{value}</div>
          <div className="text center">{value}</div>
          <div className="text bottom">{value}</div>
        </div>
      </div>
    </Wrapper>
  );
}

const Wrapper = styled.div<{
  $hovered: boolean;
  $disabled: boolean;
  $faceUp: boolean;
  $size: CardSize;
}>`
  perspective: 900px;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.8 : 1)};
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};
  
  width: ${({ $size }) => sizeMap[$size].width};
  height: ${({ $size }) => sizeMap[$size].height};

  .card {
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: ${({ $size }) => sizeMap[$size].radius};
    transform-style: preserve-3d;
    transition: transform 0.4s ease, box-shadow 0.3s ease;

    transform: ${({ $faceUp, $hovered }) => `
      rotateY(${$faceUp ? '180deg' : '0deg'})
      translateY(${$hovered ? '-10%' : '0'})
    `};

    box-shadow: ${({ $hovered }) =>
      $hovered
        ? '0 15px 30px rgba(0,0,0,0.5)'
        : '0 5px 10px rgba(0,0,0,0.3)'};
  }

  .back,
  .front {
    position: absolute;
    inset: 0;
    border-radius: ${({ $size }) => sizeMap[$size].radius};
    backface-visibility: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 2px solid white;
  }

  .back {
    background: #111;
  }

  .front {
    transform: rotateY(180deg);
    color: white;
  }

  .oval {
    position: absolute;
    inset: 0;
    margin: auto;
    width: 90%;
    height: 70%;
    border-radius: 100%;
    transform: skewX(-22deg);
    background: rgba(255, 255, 255, 0.15);
  }

  .uno-text {
    font-size: ${({ $size }) => sizeMap[$size].centerSize};
    font-weight: 900;
    color: #f2c400;
    transform: rotate(-15deg);
    text-shadow: 2px 2px 0 #000;
  }

  .text {
    position: absolute;
    font-weight: 900;
    text-shadow: -1px -1px 0 #000, 1px 1px 0 #000;
  }

  .text.top {
    top: 8%;
    left: 10%;
    font-size: ${({ $size }) => sizeMap[$size].fontSize};
  }

  .text.center {
    font-size: ${({ $size }) => sizeMap[$size].centerSize};
  }

  .text.bottom {
    bottom: 8%;
    right: 10%;
    font-size: ${({ $size }) => sizeMap[$size].fontSize};
    transform: rotate(180deg);
  }
`;

// Wrapper for specialized cards with hover effect
const CardWrapper = styled.div<{
  $hovered: boolean;
  $disabled: boolean;
  $size: CardSize;
}>`
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.8 : 1)};
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};
  width: ${({ $size }) => sizeMap[$size].width};
  height: ${({ $size }) => sizeMap[$size].height};
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  transform: ${({ $hovered }) => $hovered ? 'translateY(-10%)' : 'translateY(0)'};
  box-shadow: ${({ $hovered }) =>
    $hovered ? '0 15px 30px rgba(0,0,0,0.5)' : '0 5px 10px rgba(0,0,0,0.3)'};
`;