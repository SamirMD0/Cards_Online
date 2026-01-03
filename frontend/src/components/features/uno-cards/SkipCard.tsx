import React from 'react';
import styled from 'styled-components';

interface SkipCardProps {
  color?: 'red' | 'blue' | 'green' | 'yellow';
}

const colorMap = {
  red: '#cb0323',
  blue: '#0055ff',
  green: '#1fa64a',
  yellow: '#f2c400',
};

const SkipCard: React.FC<SkipCardProps> = ({ color = 'red' }) => {
  const cardColor = colorMap[color];
  
  return (
    <StyledWrapper $color={cardColor}>
      <div className="card-container">
        <div className="card">
          <div className="front">
            <div className="oval" />
            <div className="skip-symbol">
              <svg viewBox="0 0 100 100">
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="none" 
                  stroke="#fffffd" 
                  strokeWidth="8"
                />
                <line 
                  x1="20" 
                  y1="80" 
                  x2="80" 
                  y2="20" 
                  stroke="#fffffd" 
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="text-top">
              <svg viewBox="0 0 100 100">
                <circle 
                  cx="50" 
                  cy="50" 
                  r="35" 
                  fill="none" 
                  stroke="#fffffd" 
                  strokeWidth="10"
                />
                <line 
                  x1="22" 
                  y1="78" 
                  x2="78" 
                  y2="22" 
                  stroke="#fffffd" 
                  strokeWidth="10"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="text-bottom">
              <svg viewBox="0 0 100 100">
                <circle 
                  cx="50" 
                  cy="50" 
                  r="35" 
                  fill="none" 
                  stroke="#fffffd" 
                  strokeWidth="10"
                />
                <line 
                  x1="22" 
                  y1="78" 
                  x2="78" 
                  y2="22" 
                  stroke="#fffffd" 
                  strokeWidth="10"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div<{ $color: string }>`
  width: 100%;
  height: 100%;

  .card-container {
    perspective: 800px;
    width: 100%;
    height: 100%;
  }

  .card {
    position: relative;
    width: 100%;
    height: 100%;
    background: #fffffd;
    border-radius: 0.5em;
    box-shadow: 0 0 6px -4px black;
    transition: 0.75s all;
    transform-style: preserve-3d;
    pointer-events: none;
    user-select: none;
  }

  .front {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    inset: 5%;
    border-radius: 0.6em;
    background: ${({ $color }) => $color};
    overflow: hidden;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .front .oval {
    position: absolute;
    background: ${({ $color }) => $color};
    border: 0.35em solid #fffffd;
    inset: 0;
    border-radius: 100%;
    transform-origin: center;
    transform: scale(0.92, 0.875) skewX(-22.5deg);
  }

  .skip-symbol {
    position: absolute;
    width: 55%;
    height: 55%;
    z-index: 10;
    filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.4));
  }

  .skip-symbol svg {
    width: 100%;
    height: 100%;
  }

  .text-top {
    position: absolute;
    top: 3%;
    left: 5%;
    width: 25%;
    height: 25%;
    z-index: 10;
  }

  .text-top svg {
    width: 100%;
    height: 100%;
  }

  .text-bottom {
    position: absolute;
    bottom: 3%;
    right: 5%;
    width: 25%;
    height: 25%;
    transform: rotate(180deg);
    z-index: 10;
  }

  .text-bottom svg {
    width: 100%;
    height: 100%;
  }
`;

export default SkipCard;