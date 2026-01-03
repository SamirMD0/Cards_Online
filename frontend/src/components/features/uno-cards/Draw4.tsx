import React from 'react';
import styled from 'styled-components';

const Draw4Card: React.FC = () => {
  return (
    <StyledWrapper>
      <div className="card-container">
        <div className="card">
          <div className="front">
            <div className="circle">
              <span className="red" />
              <span className="blue" />
              <span className="yellow" />
              <span className="green" />
            </div>
            <div className="draw-stack">
              <div className="stacked-card card-1" />
              <div className="stacked-card card-2" />
              <div className="stacked-card card-3" />
              <div className="stacked-card card-4" />
            </div>
            <div className="plus-four"></div>
            <div className="text-top">+4</div>
            <div className="text-bottom">+4</div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
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
    background: #28282B;
    border-radius: 0.5em;
    box-shadow: 0 0 6px -4px black;
    transition: 0.75s all;
    transform-style: preserve-3d;
    pointer-events: none;
    user-select: none;
    border: 6px solid #F5F5DC;
  }

  .front {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    inset: 0;
    border-radius: 0.5em;
    background: #28282B;
    overflow: hidden;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .circle {
    position: absolute;
    width: 70%;
    height: 85%;
    border-radius: 50%;
    transform: skew(-25deg);
    border: 4px solid white;
    display: grid;
    grid-template-columns: 1fr 1fr;
    overflow: hidden;
  }

  .circle span {
    width: 100%;
    height: 100%;
  }

  .circle .red {
    background-color: #FF2400;
    border-top-left-radius: 100%;
  }

  .circle .blue {
    background-color: #1F51FF;
    border-top-right-radius: 100%;
  }

  .circle .yellow {
    background-color: #FFEA00;
    border-bottom-left-radius: 100%;
  }

  .circle .green {
    background-color: #50C878;
    border-bottom-right-radius: 100%;
  }

  .draw-stack {
    position: absolute;
    width: 40%;
    height: 45%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 5;
  }

  .stacked-card {
    position: absolute;
    width: 55%;
    height: 70%;
    border: 2px solid #fffffd;
    border-radius: 0.2em;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  }

  .stacked-card.card-1 {
    background: #FF2400;
    transform: rotate(-25deg) translate(-30%, -20%);
    z-index: 1;
  }

  .stacked-card.card-2 {
    background: #1F51FF;
    transform: rotate(-8deg) translate(-10%, -5%);
    z-index: 2;
  }

  .stacked-card.card-3 {
    background: #FFEA00;
    transform: rotate(8deg) translate(10%, 5%);
    z-index: 3;
  }

  .stacked-card.card-4 {
    background: #50C878;
    transform: rotate(25deg) translate(30%, 20%);
    z-index: 4;
  }

  .plus-four {
    position: absolute;
    font-size: 1.4em;
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
    font-size: 0.9em;
    font-weight: 900;
    color: #fffffd;
    text-shadow:
      1px 1px 0 #191f1f,
      -1px -1px 0 #191f1f;
    z-index: 10;
  }

  .text-bottom {
    position: absolute;
    bottom: 5%;
    right: 8%;
    font-size: 0.9em;
    font-weight: 900;
    color: #fffffd;
    transform: rotate(180deg);
    text-shadow:
      1px 1px 0 #191f1f,
      -1px -1px 0 #191f1f;
    z-index: 10;
  }

  .card:before {
    content: '';
    position: absolute;
    height: 130%;
    width: 8%;
    background-color: aliceblue;
    opacity: 0.14;
    animation: glider 1.8s infinite linear;
    animation-delay: 0.05s;
    z-index: 20;
  }

  .card:after {
    content: '';
    position: absolute;
    height: 120%;
    width: 6%;
    background-color: aliceblue;
    opacity: 0.1;
    animation: glider 1.8s infinite linear;
    z-index: 20;
  }

  @keyframes glider {
    0% {
      transform: rotate(45deg) translate(-12em, 1.2em);
    }
    100% {
      transform: rotate(45deg) translate(18em, -2.8em);
    }
  }
`;

export default Draw4Card;