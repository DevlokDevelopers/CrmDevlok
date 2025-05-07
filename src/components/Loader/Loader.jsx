import React from "react";
import "./Loader.module.css";

const FancySpinner = () => {
  return (
    <div className="spinnerWrapper">
      <div className="spinner"></div>
      <p className="spinnerText">Loading leads...</p>
    </div>
  );
};

export default FancySpinner;
