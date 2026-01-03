import React from 'react';
import styled from 'styled-components';

const ChooseColorCard = () => {
  return (
    <StyledWrapper>
      <div className="card">
        <div className="circle small top-left">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="circle">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="circle small bottom-right">
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  width: 100%;
  height: 100%;

  .card {
    width: 100%;
    height: 100%;
    position: relative;
    background: #28282B;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 6px solid #F5F5DC;
    border-radius: 5px;
    transition: 0.5s;
    overflow: hidden;
  }

  .card .circle {
    width: 70%;
    height: 85%;
    border-radius: 50%;
    transform: skew(-25deg);
    border: 4px solid white;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .card .circle.small {
    position: absolute;
    width: 15%;
    height: 20%;
    border: 2px solid white;
  }

  .card .circle.top-left {
    top: 5%;
    left: 10%;
  }

  .card .circle.bottom-right {
    bottom: 5%;
    right: 10%;
  }

  .card:hover {
    cursor: pointer;
    transform: translate(0, -5px);
  }

  .card:hover:after, .card:hover:before {
    visibility: hidden;
  }

  .card .circle span:nth-child(1) {
    background-color: #FF2400;
    border-top-left-radius: 100%;
  }

  .card .circle span:nth-child(2) {
    background-color: #1F51FF;
    border-top-right-radius: 100%;
  }

  .card .circle span:nth-child(3) {
    background-color: #FFEA00;
    border-bottom-left-radius: 100%;
  }

  .card .circle span:nth-child(4) {
    background-color: #50C878;
    border-bottom-right-radius: 100%;
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
  }

  .card:after {
    content: '';
    position: absolute;
    height: 120%;
    width: 6%;
    background-color: aliceblue;
    opacity: 0.1;
    animation: glider 1.8s infinite linear;
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

export default ChooseColorCard;