import React from "react";
import "./style.css"; // 👈 Import the CSS file

const Spinner = ({ size = 40, color = "#3b82f6" }) => {
  // size now expects pixel value (default: 40px)
  return (
    <div className="spinner-container">
      <div
        className="spinner"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderTopColor: color,
        }}
      ></div>
    </div>
  );
};

export default Spinner;
