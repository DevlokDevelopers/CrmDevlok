import React from "react";
import "./Loader.css";

const FancySpinner = () => {
  return (
    <div className="spinnerWrapper">
      <div className="spinner"></div>
      <p className="spinnerText">Optimizing your view...</p>
    </div>
  );
};

export default FancySpinner;
