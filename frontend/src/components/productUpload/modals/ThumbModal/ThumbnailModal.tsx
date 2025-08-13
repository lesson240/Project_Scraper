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
  const [orientation, setOrientation] = React.useState<Orientation>(readOrientation);
  const [transformTick, setTransformTick] = React.useState(0);
  const bumpTick = () => {
    setTransformTick(v => v + 1);
    setOrientation(readOrientation());
  };

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
                onCropChange={setCrop}
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
