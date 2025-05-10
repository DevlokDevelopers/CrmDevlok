import React from "react";
import "./LoadingScreen.css";

const LoadingScreen = () => {
  return (
    <div className="fullscreen-loader">
      <div className="flowers-container">
        <div className="flower flower1"></div>
        <div className="flower flower2"></div>
        <div className="flower flower3"></div>
        <div className="flower flower4"></div>
        <div className="flower flower5"></div>
      </div>
      <p className="loading-text">Loading your project...</p>
    </div>
  );
};

export default LoadingScreen;
