// components/LoadingScreen.js
import React from "react";
import "./LoadingScreen.css";

const LoadingScreen = () => {
  return (
    <div className="fullscreen-loader">
      <div className="leaves-container">
        <div className="leaf leaf1"></div>
        <div className="leaf leaf2"></div>
        <div className="leaf leaf3"></div>
        <div className="leaf leaf4"></div>
        <div className="leaf leaf5"></div>
      </div>
      <p className="loading-text">Loading your project...</p>
    </div>
  );
};

export default LoadingScreen;
