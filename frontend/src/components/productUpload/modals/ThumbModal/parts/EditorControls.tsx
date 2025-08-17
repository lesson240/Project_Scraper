import React, { useCallback } from "react";
import leftTurn from "@/assets/images/shapes/leftTurn.svg?url";
import moveUp from "@/assets/images/shapes/moveUp.svg?url";
import rightTurn from "@/assets/images/shapes/rightTurn.svg?url";
import fillTheScreen from "@/assets/images/shapes/fillTheScreen.svg?url";
import moveLeft from "@/assets/images/shapes/moveLeft.svg?url";
import square from "@/assets/images/shapes/square.svg?url";
import moveRight from "@/assets/images/shapes/moveRight.svg?url";
import zoomIn from "@/assets/images/shapes/zoomIn.svg?url";
import flipHorizontally from "@/assets/images/shapes/flipHorizontally.svg?url";
import moveDown from "@/assets/images/shapes/moveDown.svg?url";
import flipVertically from "@/assets/images/shapes/flipVertically.svg?url";
import zoomOut from "@/assets/images/shapes/zoomOut.svg?url";

type Props = {
  onRotateLeft?: () => void;
  onMoveUp?: () => void;
  onRotateRight?: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onMoveDown?: () => void;
  onFlipH?: () => void;
  onFlipV?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFillScreen?: () => void;
  onToggleSquareLock?: () => void;
  onToggleEraser?: () => void;
  onToggleLasso?: () => void;
  isSquareLocked?: boolean;
  isEraserActive?: boolean;
  isLassoActive?: boolean;
  onAfterAction?: () => void;
};

// (버튼 onClick 래핑 유틸: 중복 줄이고 안정성 확보)
const call = (fn?: () => void, after?: () => void) => () => {
  if (fn) fn();
  // 다음 프레임에서 보장 호출(스타일/레이라웃 반영 후)
  if (after) {
    requestAnimationFrame(() => after());
  }
};

export default function EditorControls(p: Props) {
  const handleButtonClick = (callback?: () => void) => {
    if (callback) {
      callback();

      if (p.onAfterAction) {
        p.onAfterAction();
      }
    }
  };

  return (
    <div className="editor-controls">
      <div className="shapes-wrapper">
        <button onClick={() => handleButtonClick(p.onRotateLeft)}><img src={leftTurn} /></button>
        <button onClick={() => handleButtonClick(p.onMoveUp)}><img src={moveUp} /></button>
        <button onClick={() => handleButtonClick(p.onRotateRight)}><img src={rightTurn} /></button>
        <button onClick={() => handleButtonClick(p.onFillScreen)}><img src={fillTheScreen} /></button>
      </div>
      <div className="shapes-wrapper">
        <button onClick={() => handleButtonClick(p.onMoveLeft)}><img src={moveLeft} /></button>
        <button
          onClick={() => handleButtonClick(p.onToggleSquareLock)}
          className={p.isSquareLocked ? 'square-locked' : ''}
        ><img src={square} /></button>
        <button onClick={() => handleButtonClick(p.onMoveRight)}><img src={moveRight} /></button>
        <button onClick={() => handleButtonClick()}>🧽</button> {/* Eraser button - 기능 연결 해제 */}
        <button onClick={() => handleButtonClick()}>🪢</button> {/* Lasso button - 기능 연결 해제 */}
      </div>
      <div className="shapes-wrapper">
        <button onClick={() => handleButtonClick(p.onFlipH)}><img src={flipHorizontally} /></button>
        <button onClick={() => handleButtonClick(p.onMoveDown)}><img src={moveDown} /></button>
        <button onClick={() => handleButtonClick(p.onFlipV)}><img src={flipVertically} /></button>
        <button onClick={() => handleButtonClick(p.onZoomIn)}>
          <img src={zoomIn} />
        </button>
        <button onClick={() => handleButtonClick(p.onZoomOut)}>
          <img src={zoomOut} />
        </button>
      </div>
      <div className="shapes-wrapper">


      </div>
    </div>
  );
}
