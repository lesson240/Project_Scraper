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
  onUndo?(): void;
  onRedo?(): void;
  onMoveUp(): void;
  onMoveDown(): void;
  onMoveLeft(): void;
  onMoveRight(): void;
  onRotateLeft(): void;
  onRotateRight(): void;
  onFlipH(): void;
  onFlipV(): void;
  onZoomIn(): void;
  onZoomOut(): void;
  onFit(): void;
  onFillScreen(): void;
  onToggleSelect?(): void;
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
  // ✅ 버튼 클릭 시 즉시 동기화 보장
  const handleButtonClick = useCallback((action: () => void) => {
    action();
    // 다음 프레임에서 afterAction 호출 보장
    if (p.onAfterAction) {
      requestAnimationFrame(() => {
        requestAnimationFrame(p.onAfterAction);
      });
    }
  }, [p.onAfterAction]);

  return (
    <div className="editor-controls">
      <div className="shapes-wrapper">
        <button onClick={() => handleButtonClick(p.onRotateLeft)}>
          <img
            src={leftTurn} /></button>
        <button onClick={() => handleButtonClick(p.onMoveUp)}>
          <img
            src={moveUp} /></button>
        <button onClick={() => handleButtonClick(p.onRotateRight)}>
          <img
            src={rightTurn} /></button>
        <button onClick={() => handleButtonClick(p.onFillScreen)}>
          <img
            src={fillTheScreen} /></button>
      </div>
      <div className="shapes-wrapper">
        <button onClick={() => handleButtonClick(p.onMoveLeft)}>
          <img
            src={moveLeft} /></button>
        <button onClick={() => handleButtonClick(p.onToggleSelect)}>
          <img
            src={square} /></button>
        <button onClick={() => handleButtonClick(p.onMoveRight)}>
          <img
            src={moveRight} /></button>
        <button onClick={() => handleButtonClick(p.onZoomIn)}>
          <img
            src={zoomIn} /></button>
      </div>
      <div className="shapes-wrapper">
        <button onClick={() => handleButtonClick(p.onFlipH)}>
          <img
            src={flipHorizontally} /></button>
        <button onClick={() => handleButtonClick(p.onMoveDown)}>
          <img
            src={moveDown} /></button>
        <button onClick={() => handleButtonClick(p.onFlipV)}>
          <img
            src={flipVertically} /></button>
        <button onClick={() => handleButtonClick(p.onZoomOut)}>
          <img
            src={zoomOut} /></button>
      </div>
    </div>
  );
}
