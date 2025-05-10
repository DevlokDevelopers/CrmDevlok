import React from "react";
import "./LoadingScreen.css";

const LoadingScreen = () => {
  const createBurst = (e) => {
    const burst = document.createElement("div");
    burst.className = "burst";
    burst.style.left = `${e.clientX}px`;
    burst.style.top = `${e.clientY}px`;
    document.body.appendChild(burst);

    setTimeout(() => burst.remove(), 1000);
  };

  return (
    <div className="click-area" onClick={createBurst}>
      <div className="loading-text">Click anywhere ✨</div>
    </div>
  );
};

export default LoadingScreen;
