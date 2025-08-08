import React from "react";


export default function EditorControls() {
  return (
    <div className="editor-controls">
      <div className="shapes-wrapper">
        <button>
          <img
            src="/src/assets/images/shapes/leftTurn.svg" /></button>
        <button>
          <img
            src="/src/assets/images/shapes/moveUp.svg" /></button>
        <button>
          <img
            src="/src/assets/images/shapes/rightTurn.svg" /></button>
        <button>
          <img
            src="/src/assets/images/shapes/fillTheScreen.svg" /></button>
      </div>
      <div className="shapes-wrapper">
        <button>
          <img
            src="/src/assets/images/shapes/moveLeft.svg" /></button>
        <button>
          <img
            src="/src/assets/images/shapes/square.svg" /></button>
        <button>
          <img
            src="/src/assets/images/shapes/moveRight.svg" /></button>
        <button>
          <img
            src="/src/assets/images/shapes/zoomIn.svg" /></button>
      </div>
      <div className="shapes-wrapper">
        <button>
          <img
            src="/src/assets/images/shapes/flipHorizontally.svg" /></button>
        <button>
          <img
            src="/src/assets/images/shapes/moveDown.svg" /></button>
        <button>
          <img
            src="/src/assets/images/shapes/flipVertically.svg" /></button>
        <button>
          <img
            src="/src/assets/images/shapes/zoomOut.svg" /></button>
      </div>
    </div>
  );
}
