import React from 'react';
import styled from 'styled-components';

interface Draw2CardProps {
  color?: 'red' | 'blue' | 'green' | 'yellow';
}

const colorMap = {
  red: '#cb0323',
  blue: '#0055ff',
  green: '#1fa64a',
  yellow: '#f2c400',
};

const Draw2Card: React.FC<Draw2CardProps> = ({ color = 'red' }) => {
  const cardColor = colorMap[color];
  
  return (
    <StyledWrapper $color={cardColor}>
      <div className="card-container">
        <div className="card">
          <div className="front">
            <div className="oval" />
            <div className="draw-stack">
              <div className="stacked-card card-1" />
              <div className="stacked-card card-2" />
            </div>
            <div className="plus-two"></div>
            <div className="text-top">+2</div>
            <div className="text-bottom">+2</div>
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

  .draw-stack {
    position: absolute;
    width: 45%;
    height: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .stacked-card {
    position: absolute;
    width: 70%;
    height: 85%;
    background: ${({ $color }) => $color};
    border: 3px solid #fffffd;
    border-radius: 0.3em;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .stacked-card.card-1 {
    transform: rotate(-15deg) translate(-15%, -10%);
  }

  .stacked-card.card-2 {
    transform: rotate(15deg) translate(15%, 10%);
  }

  .plus-two {
    position: absolute;
    font-size: 1.8em;
    font-weight: 900;
    color: #fffffd;
    text-shadow:
      2px 2px 0 #191f1f,
      -1px -1px 0 #191f1f,
      1px -1px 0 #191f1f,
      -1px 1px 0 #191f1f;
    z-index: 10;
  }

  .text-top {
    position: absolute;
    top: 5%;
    left: 8%;
    font-size: 1em;
    font-weight: 900;
    color: #fffffd;
    text-shadow:
      1px 1px 0 #191f1f,
      -1px -1px 0 #191f1f;
  }

  .text-bottom {
    position: absolute;
    bottom: 5%;
    right: 8%;
    font-size: 1em;
    font-weight: 900;
    color: #fffffd;
    transform: rotate(180deg);
    text-shadow:
      1px 1px 0 #191f1f,
      -1px -1px 0 #191f1f;
  }
`;

export default Draw2Card;