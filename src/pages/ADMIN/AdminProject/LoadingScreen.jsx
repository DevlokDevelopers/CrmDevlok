// components/LoadingScreen.js
import React from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import "./LoadingScreen.css";

const LoadingScreen = () => {
  return (
    <div className="fullscreen-loader">
      <Player
        autoplay
        loop
        src="https://assets9.lottiefiles.com/packages/lf20_s1eypznm.json" // Deer running animation
        style={{ height: "300px", width: "300px" }}
      />
      <p className="loading-text">Loading your project...</p>
    </div>
  );
};

export default LoadingScreen;
