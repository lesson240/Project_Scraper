import React from "react";
import { ModalBase, ModalHeader, ModalBody, ModalFooter } from "@/components/common/Modal";
import ThumbnailPanel from "./parts/ThumbnailPanel";
import EditorMain, { EditorMainRef } from "./parts/EditorMain";
import ViewerPanel from "./parts/ViewerPanel";
import ThumbModalFooter from "./parts/ThumbnailModalFooter";
import { ThumbResultButtons } from "./parts/ThumbnailFunctionButtons";
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

  // 정사각형 고정 상태를 로컬에서 관리
  const [isSquareLocked, setIsSquareLocked] = React.useState(false);

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

  // 정사각형 고정 토글 핸들러
  const handleToggleSquareLock = React.useCallback(() => {
    setIsSquareLocked(prev => !prev);
    // EditorMain의 정사각형 고정 토글 함수 호출
    editorMainRef.current?.toggleSquareLock();
  }, []);

  // 이미지 선택 시 editormain 상태 초기화
  const handleImageSelect = React.useCallback((idx: number) => {
    setCurrentIndex(idx);
    // editormain의 transform 상태 초기화
    t.fit(); // fit() 함수로 모든 변환 상태 초기화
    // orientation 상태도 초기화
    setOrientation({ angle: 0, flipX: false, flipY: false });
    // crop 상태도 초기화
    setCrop(null);
    // 정사각형 고정 상태도 초기화
    setIsSquareLocked(false);
  }, [setCurrentIndex, t, setOrientation]);

  // 레이어 초기화 함수
  const handleLayerReset = React.useCallback(() => {
    // editormain의 transform 상태를 처음 상태로 초기화
    t.fit(); // fit() 함수로 모든 변환 상태 초기화
    // orientation 상태도 초기화
    setOrientation({ angle: 0, flipX: false, flipY: false });
    // crop 상태도 초기화
    setCrop(null);
    // 정사각형 고정 상태도 초기화
    setIsSquareLocked(false);
  }, [t, setOrientation]);

  // 패널 적용 핸들러 래퍼
  const handlePanelApplyWrapper = React.useCallback((e?: React.MouseEvent) => {
    handlePanelApply(e, t, setOrientation);
  }, [handlePanelApply, t, setOrientation]);

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} disableOutsideClick={true}>
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
                    onStudio={() => console.log("올땀 스튜디오")}
                    onEditorPlus={() => console.log("에디터 +")}
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
                  onFillScreen={() => {
                    // EditorMain의 handleFillScreen 함수 호출
                    editorMainRef.current?.handleFillScreen();
                  }}
                  onToggleSquareLock={() => {
                    // EditorMain의 정사각형 고정 토글 함수 호출
                    editorMainRef.current?.toggleSquareLock();
                  }}
                  onToggleBrush={() => {
                    // EditorMain의 Brush 도구 토글 함수 호출
                    editorMainRef.current?.toggleBrush();
                  }}
                  onToggleEraser={() => {
                    // EditorMain의 Eraser 도구 토글 함수 호출
                    editorMainRef.current?.toggleEraser();
                  }}
                  onToggleLasso={() => {
                    // EditorMain의 Lasso 도구 토글 함수 호출
                    editorMainRef.current?.toggleLasso();
                  }}
                  isSquareLocked={isSquareLocked}
                  isBrushActive={editorMainRef.current?.isBrushActive || false}
                  isEraserActive={editorMainRef.current?.isEraserActive || false}
                  isLassoActive={editorMainRef.current?.isLassoActive || false}
                  onAfterAction={bumpTick}
                />
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
