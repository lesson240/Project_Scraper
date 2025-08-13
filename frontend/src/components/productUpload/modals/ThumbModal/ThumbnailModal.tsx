import React from "react";
import { ModalBase, ModalHeader, ModalBody, ModalFooter } from "@/components/common/Modal";
import ThumbnailPanel from "./parts/ThumbnailPanel";
import EditorMain from "./parts/EditorMain";
import ViewerPanel from "./parts/ViewerPanel";
import ThumbModalFooter from "./parts/ThumbnailModalFooter";
import { ThumbResultButtons, ThumbEditorButtons } from "./parts/ThumbnailFunctionButtons";
import SectionLabel from "./parts/SectionLabel";
import EditorControls from "./parts/EditorControls";
import { useCanvasTransform } from "@/hooks/useCanvasTransform";
import type { Rect } from "@/hooks/useSelectionRect";
import "@/styles/productUpload/thumbnailModal.css";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  thumbnails: string[];
  currentIndex: number;
  setCurrentIndex: (idx: number) => void;
  addImages: (newImages: string[]) => void;
  removeImage: (idx: number) => void;
  resetImages: () => void;
  saveImages: () => void;
};

type Orientation = { angle: number; flipX: boolean; flipY: boolean };

export default function ThumbModal({
  isOpen,
  onClose,
  thumbnails,
  currentIndex,
  setCurrentIndex,
  addImages,
  removeImage,
  resetImages,
  saveImages,
}: Props) {
  const t = useCanvasTransform();
  const [crop, setCrop] = React.useState<Rect | null>(null);
  const readOrientation = React.useCallback<() => Orientation>(
    () => t.getOrientation(),
    [t]
  );

  // orientation 기본값 설정으로 undefined 방지
  const [orientation, setOrientation] = React.useState<Orientation>(() => ({
    angle: 0,
    flipX: false,
    flipY: false
  }));

  const [transformTick, setTransformTick] = React.useState(0);
  const bumpTick = React.useCallback(() => {
    setTransformTick(v => v + 1);
    // transform 변경 후 orientation 즉시 동기화
    const newOrientation = t.getOrientation();
    // console.log('Transform changed, new orientation:', newOrientation); // 디버깅용
    setOrientation(newOrientation);
  }, [t]);

  // ✅ orientation 변경 시 디버깅 (개발 환경에서만)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // console.log('Orientation state updated:', orientation);
    }
  }, [orientation]);

  // ✅ transform 객체 변경 감지
  React.useEffect(() => {
    const checkTransform = () => {
      const currentOrientation = t.getOrientation();
      if (
        currentOrientation.angle !== orientation.angle ||
        currentOrientation.flipX !== orientation.flipX ||
        currentOrientation.flipY !== orientation.flipY
      ) {
        // console.log('Transform mismatch detected, updating...');
        setOrientation(currentOrientation);
      }
    };

    // 주기적으로 transform 상태 확인 (개발 환경에서만)
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(checkTransform, 100);
      return () => clearInterval(interval);
    }
  }, [t, orientation]);

  return (
    <ModalBase isOpen={isOpen} onClose={onClose}>
      <ModalHeader title="썸네일" onClose={onClose} />
      <ModalBody>
        <div className="thumb-modal-container">
          <SectionLabel text="썸네일 패널" />
          <ThumbnailPanel
            thumbnails={thumbnails}
            currentIndex={currentIndex}
            onAdd={addImages}
            onRemove={removeImage}
            onSelect={setCurrentIndex}
          />

          <div className="thumb-main-wrapper">
            <div className="editor-wrapper">
              <SectionLabel text="올땀 에디터" />
              <EditorMain
                image={thumbnails[currentIndex] || ""}
                transform={t}
                onCropChange={(r) => {
                  if (r) {
                    setCrop({
                      x: r.x,
                      y: r.y,
                      w: r.w,
                      h: r.h
                    });
                  } else {
                    setCrop(null);
                  }
                }}
                transformTick={transformTick}
              />
            </div>
            <div className="viewer-wrapper">
              <SectionLabel text="뷰어" />
              <div className="division-wrapper">
                <div className="viewer-main">
                  <ViewerPanel
                    image={thumbnails[currentIndex] || ""}
                    crop={crop}
                    orientation={orientation}
                  />
                </div>
                <div className="editor-func-buttons-wrapper">
                  <ThumbResultButtons
                    onPriceSet={() => console.log("모달 가격 설정")}
                    onTagSet={() => console.log("모달 태그 설정")}
                  />
                </div>
              </div>
              <div className="tolltip-place">
              </div>
              <div className="division-wrapper">
                {/* 모달 전용 기능 버튼 */}
                <EditorControls
                  onMoveUp={t.moveUp}
                  onMoveDown={t.moveDown}
                  onMoveLeft={t.moveLeft}
                  onMoveRight={t.moveRight}
                  onRotateLeft={t.rotateLeft}
                  onRotateRight={t.rotateRight}
                  onFlipH={t.flipH}
                  onFlipV={t.flipV}
                  onZoomIn={t.zoomIn}
                  onZoomOut={t.zoomOut}
                  onFit={t.fit}
                  onAfterAction={bumpTick}
                />
                <div className="division-line">
                </div>
                <div className="editor-func-buttons-wrapper">
                  <ThumbEditorButtons
                    onPriceSet={() => console.log("모달 가격 설정")}
                    onTagSet={() => console.log("모달 태그 설정")}
                    onDelete={() => removeImage(currentIndex)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <ThumbModalFooter onReset={resetImages} onSave={saveImages} />
      </ModalFooter>
    </ModalBase>
  );
}
