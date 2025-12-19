import { useState } from 'react';
import styled from 'styled-components';

export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'wild';
export type CardValue = string | number;

interface UnoCardProps {
  color: CardColor;
  value: CardValue;
  faceUp?: boolean; // NEW
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}


const colorMap: Record<CardColor, string> = {
  red: '#cb0323',
  blue: '#0055ff',
  green: '#1fa64a',
  yellow: '#f2c400',
  wild: '#111',
};

export default function UnoCard({
  color,
  value,
  faceUp = true, // default: player sees their cards
  onClick,
  disabled = false,
  className = '',
}: UnoCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Wrapper
      className={className}
      onClick={!disabled ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      $hovered={hovered}
      $disabled={disabled}
      $faceUp={faceUp} 
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
}>`
  perspective: 900px;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};

 .card {
  width: 140px;
  height: 220px;
  position: relative;
  border-radius: 16px;
  transform-style: preserve-3d;
  transition: transform 0.6s ease, box-shadow 0.3s ease;

  transform: ${({ $faceUp, $hovered }) => `
    rotateY(${$faceUp ? '180deg' : '0deg'})
    translateY(${$hovered ? '-12px' : '0'})
  `};

  box-shadow: ${({ $hovered }) =>
    $hovered
      ? '0 30px 50px rgba(0,0,0,0.6)'
      : '0 10px 20px rgba(0,0,0,0.4)'};
}


  .back,
  .front {
    position: absolute;
    inset: 10px;
    border-radius: 14px;
    backface-visibility: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .back {
    background: #141414;
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

  .oval.border {
    border: 6px solid white;
    background: transparent;
  }

  .uno-text {
    font-size: 3rem;
    font-weight: 900;
    color: #f2c400;
    transform: rotate(-15deg);
  }

  .text {
    position: absolute;
    font-weight: 900;
    text-shadow: -2px -2px 0 #000, 2px 2px 0 #000;
  }

  .text.top {
    top: 12px;
    left: 14px;
    font-size: 1.25rem;
  }

  .text.center {
    font-size: 3.5rem;
  }

  .text.bottom {
    bottom: 12px;
    right: 14px;
    font-size: 1.25rem;
    transform: rotate(180deg);
  }
`;
