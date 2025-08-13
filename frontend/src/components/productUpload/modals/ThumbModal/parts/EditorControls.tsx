import React from "react";
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
  onUndo?(): void; onRedo?(): void;
  onMoveUp(): void; onMoveDown(): void; onMoveLeft(): void; onMoveRight(): void;
  onRotateLeft(): void; onRotateRight(): void;
  onFlipH(): void; onFlipV(): void;
  onZoomIn(): void; onZoomOut(): void; onFit(): void;
  onToggleSelect?(): void;
  onAfterAction?: () => void;
};

// (버튼 onClick 래핑 유틸: 중복 줄이고 안정성 확보)
const call = (fn?: () => void, after?: () => void) => () => {
  fn?.();
  // 다음 프레임에서 보장 호출(스타일/레이라웃 반영 후)
  requestAnimationFrame(() => after?.());
};

export default function EditorControls(p: Props) {
  return (
    <div className="editor-controls">
      <div className="shapes-wrapper">
        <button onClick={call(p.onRotateLeft, p.onAfterAction)}>
          <img
            src={leftTurn} /></button>
        <button onClick={call(p.onMoveUp, p.onAfterAction)}>
          <img
            src={moveUp} /></button>
        <button onClick={call(p.onRotateRight, p.onAfterAction)}>
          <img
            src={rightTurn} /></button>
        <button onClick={call(p.onFit, p.onAfterAction)}>
          <img
            src={fillTheScreen} /></button>
      </div>
      <div className="shapes-wrapper">
        <button onClick={call(p.onMoveLeft, p.onAfterAction)}>
          <img
            src={moveLeft} /></button>
        <button onClick={() => (p.onToggleSelect ? p.onToggleSelect() : p.onFit())}>
          <img
            src={square} /></button>
        <button onClick={call(p.onMoveRight, p.onAfterAction)}>
          <img
            src={moveRight} /></button>
        <button onClick={call(p.onZoomIn, p.onAfterAction)}>
          <img
            src={zoomIn} /></button>
      </div>
      <div className="shapes-wrapper">
        <button onClick={call(p.onFlipH, p.onAfterAction)}>
          <img
            src={flipHorizontally} /></button>
        <button onClick={call(p.onMoveDown, p.onAfterAction)}>
          <img
            src={moveDown} /></button>
        <button onClick={call(p.onFlipV, p.onAfterAction)}>
          <img
            src={flipVertically} /></button>
        <button onClick={call(p.onZoomOut, p.onAfterAction)}>
          <img
            src={zoomOut} /></button>
      </div>
    </div>
  );
}
