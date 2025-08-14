import React from "react";
import { ModalBase, ModalHeader, ModalBody, ModalFooter } from "@/components/common/Modal";
import ThumbnailPanel from "./parts/ThumbnailPanel";
import EditorMain, { EditorMainRef } from "./parts/EditorMain";
import ViewerPanel from "./parts/ViewerPanel";
import ThumbModalFooter from "./parts/ThumbnailModalFooter";
import { ThumbResultButtons, ThumbEditorButtons } from "./parts/ThumbnailFunctionButtons";
import SectionLabel from "./parts/SectionLabel";
import EditorControls from "./parts/EditorControls";
import ThumbnailTransformSync from "./components/ThumbnailTransformSync";
import { useThumbnailTransform } from "./lib/useThumbnailTransform";
import { useThumbnailPanel } from "./lib/useThumbnailPanel";
import { useThumbnailReorder } from "./lib/useThumbnailReorder";
import type { Rect } from "@/hooks/useSelectionRect";
import type { ThumbnailModalProps } from "./lib/thumbnail.types";
import "@/styles/productUpload/thumbnailModal.css";

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
  updateThumbnail,
  updateThumbnails,
}: ThumbnailModalProps) {
  // 패널 적용 실행 중 플래그
  const isPanelApplyingRef = React.useRef(false);

  // EditorMain ref 생성
  const editorMainRef = React.useRef<EditorMainRef>(null);

  // Transform 관련 로직을 커스텀 훅으로 분리
  const {
    t,
    orientation,
    setOrientation,
    safeSetOrientation,
    bumpTick
  } = useThumbnailTransform(isPanelApplyingRef);

  const [crop, setCrop] = React.useState<Rect | null>(null);

  // 패널 적용 로직을 커스텀 훅으로 분리
  const { handlePanelApply } = useThumbnailPanel(
    isPanelApplyingRef,
    currentIndex,
    crop,
    thumbnails,
    updateThumbnail
  );

  // 순서 변경 로직을 커스텀 훅으로 분리
  const { handleReorder } = useThumbnailReorder(
    thumbnails,
    currentIndex,
    updateThumbnails,
    setCurrentIndex
  );

  // 이미지 선택 시 editormain 상태 초기화
  const handleImageSelect = React.useCallback((idx: number) => {
    setCurrentIndex(idx);
    // editormain의 transform 상태 초기화
    t.fit(); // fit() 함수로 모든 변환 상태 초기화
    // orientation 상태도 초기화
    setOrientation({ angle: 0, flipX: false, flipY: false });
    // crop 상태도 초기화
    setCrop(null);
  }, [setCurrentIndex, t, setOrientation]);

  // 레이어 초기화 함수
  const handleLayerReset = React.useCallback(() => {
    // editormain의 transform 상태를 처음 상태로 초기화
    t.fit(); // fit() 함수로 모든 변환 상태 초기화
    // orientation 상태도 초기화
    setOrientation({ angle: 0, flipX: false, flipY: false });
    // crop 상태도 초기화
    setCrop(null);
  }, [t, setOrientation]);

  // 패널 적용 핸들러 래퍼
  const handlePanelApplyWrapper = React.useCallback((e?: React.MouseEvent) => {
    handlePanelApply(e, t, setOrientation);
  }, [handlePanelApply, t, setOrientation]);

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
            onSelect={handleImageSelect}
            onReorder={handleReorder}
          />

          <div className="thumb-main-wrapper">
            <div className="editor-wrapper">
              <SectionLabel text="올땀 에디터" />
              <EditorMain
                ref={editorMainRef}
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
              />
            </div>
            <div className="viewer-wrapper">
              <SectionLabel text="뷰어" />
              <div className="division-wrapper">
                <div className="viewer-main">
                  <ViewerPanel
                    image={thumbnails[currentIndex] || ""}
                    crop={crop}
                    orientation={isPanelApplyingRef.current
                      ? { angle: 0, flipX: false, flipY: false } // 패널 적용 중 고정값
                      : orientation // 정상 상태
                    }
                  />
                </div>
                <div className="editor-func-buttons-wrapper">
                  <ThumbResultButtons
                    onLayerReset={handleLayerReset}
                    onTagSet={() => console.log("모달 태그 설정")}
                    onPanelApply={handlePanelApplyWrapper}
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
                  onFillScreen={() => {
                    // EditorMain의 handleFillScreen 함수 호출
                    editorMainRef.current?.handleFillScreen();
                  }}
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

      {/* Transform 동기화 컴포넌트 (렌더링하지 않음) */}
      <ThumbnailTransformSync
        isOpen={isOpen}
        isPanelApplyingRef={isPanelApplyingRef}
        t={t}
        orientation={orientation}
        setOrientation={setOrientation}
      />
    </ModalBase>
  );
}
