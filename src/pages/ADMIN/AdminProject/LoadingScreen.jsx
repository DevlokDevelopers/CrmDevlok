import React from "react";
import "./LoadingScreen.css";

const LoadingScreen = () => {
  return (
    <div class="game-loader">
  <div class="ship"></div>
  <div class="asteroid a1"></div>
  <div class="asteroid a2"></div>
  <div class="asteroid a3"></div>
  <div class="loading-msg">Navigating through asteroids...</div>
</div>


        );
};

export default LoadingScreen;
