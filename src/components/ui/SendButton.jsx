"use client";

import { useState, useRef, useCallback } from "react";

export default function SendButton({
  label = "Send",
  successLabel = "Done",
  onSend,
  scale = 1,
  planeColor = "#4F29F0",
  textColor = "#C3C8DE",
  backgroundColor = "#ffffff",
  className = "",
  disabled = false,
}) {
  const [active, setActive] = useState(false);
  const buttonRef = useRef(null);

  const handleClick = useCallback(async () => {
    if (active || disabled) return;
    setActive(true);
    try {
      await onSend?.();
    } catch (_) {

    }
    setTimeout(() => setActive(false), 2600);
  }, [active, disabled, onSend]);

  const W = 200;
  const H = 52;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Varela+Round&display=swap');

        .sndbtn-root {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: ${W * scale}px;
          height: ${H * scale}px;
        }

        .sndbtn {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          border: 0;
          padding: 0;
          width: ${W}px;
          height: ${H}px;
          background: none;
          color: ${textColor};
          cursor: ${disabled ? "not-allowed" : "pointer"};
          outline: none;
          opacity: ${disabled ? 0.5 : 1};
          transform: scale(${scale});
          transform-origin: center center;
          font-family: 'Varela Round', sans-serif;
          font-size: 15px;
          white-space: nowrap;
        }

        .sndbtn__layer {
          display: block;
          position: absolute;
          top: -20px;
          left: 0;
          width: 100%;
          height: ${H + 40}px;
          z-index: 2;
          pointer-events: none;
          fill: ${backgroundColor};
          filter: drop-shadow(0 4px 16px rgba(0,0,0,0.10));
        }

        .sndbtn__plane {
          z-index: 3;
          position: absolute;
          left: 28px;
          display: block;
          width: 24px;
          height: 24px;
          fill: ${planeColor};
          transform: translate3d(0, 0, 0);
          perspective: 500px;
        }

        .sndbtn__labels {
          list-style: none;
          padding: 0 5px 0 0;
          margin: 0;
          position: relative;
          overflow: hidden;
          white-space: nowrap;
        }

        .sndbtn__labels li {
          display: inline-block;
          position: relative;
          z-index: 2;
          padding-left: 44px;
          white-space: nowrap;
          transition: transform 0.3s ease 0s, opacity 0.3s ease 0s;
        }

        .sndbtn__labels li:first-child { opacity: 1; }

        .sndbtn__labels li:last-child {
          position: absolute;
          left: 0;
          top: 100%;
          opacity: 0;
          white-space: nowrap;
        }

        .sndbtn--active .sndbtn__plane {
          animation: sndbtn-orbit 1.5s alternate linear;
        }

        .sndbtn--active .sndbtn__labels li {
          transform: translateY(-100%);
          transition: transform 0.3s ease 1.2s, opacity 0.3s ease 1.2s;
        }

        .sndbtn--active .sndbtn__labels li:first-child { opacity: 0; }
        .sndbtn--active .sndbtn__labels li:last-child  { opacity: 1; }

        .sndbtn--active .sndbtn__layer path {
          animation: sndbtn-morph 2s ease forwards;
        }

        @keyframes sndbtn-morph {
          0% {
            d: path("M174,72H26C11.6,72,0,60.4,0,46v-12C0,19.6,11.6,8,26,8h148c14.4,0,26,11.6,26,26v12C200,60.4,188.4,72,174,72z");
          }
          20% {
            d: path("M174,72H26C11.6,72,0,60.4,0,46v-12C0,19.6,11.6,8,26,8h62c0,0,10,18,50,18s36-18,36-18h0c14.4,0,26,11.6,26,26v12C200,60.4,188.4,72,174,72z");
          }
          100% {
            d: path("M174,72H26C11.6,72,0,60.4,0,46v-12C0,19.6,11.6,8,26,8h148c14.4,0,26,11.6,26,26v12C200,60.4,188.4,72,174,72z");
          }
        }

        @keyframes sndbtn-orbit {
          0%   { transform: rotate3d(1,0,0,0deg)   translateZ(60px) scale3d(1,1,1);   animation-timing-function: ease-in;  }
          10%  { transform: rotate3d(1,.6,0,-10deg) translateZ(60px) scale3d(1,1,1);   animation-timing-function: ease-out; z-index: 3; }
          20%  { transform: rotate3d(1,.6,0,30deg)  translateZ(60px) scale3d(1,1,1);   animation-timing-function: ease-out; z-index: 3; }
          30%  { transform: rotate3d(1,.6,0,35deg)  translateZ(60px) scale3d(1,1,1);   z-index: 3; }
          40%  { transform: rotate3d(1,.6,0,120deg) translateZ(60px) scale3d(.7,.7,1); z-index: 1; }
          70%  { transform: rotate3d(1,.6,0,240deg) translateZ(60px) scale3d(.7,.7,1); animation-timing-function: ease-out; z-index: 1; }
          100% { transform: rotate3d(1,0,0,360deg)  translateZ(60px) scale3d(1,1,1);   z-index: 3; }
        }
      `}</style>

      <div className={`sndbtn-root ${className}`}>
        <button
          ref={buttonRef}
          className={`sndbtn${active ? " sndbtn--active" : ""}`}
          onClick={handleClick}
          disabled={disabled}
          type="button"
          aria-label={active ? successLabel : label}
        >
          {/* Pill-shaped background — morphs on active */}
          <svg
            className="sndbtn__layer"
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${W} ${H + 40}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M174,72H26C11.6,72,0,60.4,0,46v-12C0,19.6,11.6,8,26,8h148c14.4,0,26,11.6,26,26v12C200,60.4,188.4,72,174,72z" />
          </svg>

          {/* Paper plane */}
          <svg
            className="sndbtn__plane"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 28 26"
            aria-hidden="true"
          >
            <path d="M5.25,15.24,18.42,3.88,7.82,17l0,4.28a.77.77,0,0,0,1.36.49l3-3.68,5.65,2.25a.76.76,0,0,0,1-.58L22,.89A.77.77,0,0,0,20.85.1L.38,11.88a.76.76,0,0,0,.09,1.36Z" />
          </svg>

          {/* Labels */}
          <ul className="sndbtn__labels">
            <li>{label}</li>
            <li>{successLabel}</li>
          </ul>
        </button>
      </div>
    </>
  );
}