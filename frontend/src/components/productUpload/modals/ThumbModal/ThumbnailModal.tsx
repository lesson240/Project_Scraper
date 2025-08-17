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
import Toast from "@/components/common/Toast";
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
  origin_goods_code,
}: ThumbnailModalProps) {
  // 패널 적용 실행 중 플래그
  const isPanelApplyingRef = React.useRef(false);

  // EditorMain ref 생성
  const editorMainRef = React.useRef<EditorMainRef>(null);

  // 정사각형 고정 상태를 로컬에서 관리
  const [isSquareLocked, setIsSquareLocked] = React.useState(false);

  // Toast 상태 관리
  const [toastMessage, setToastMessage] = React.useState<string>("");

  // origin_goods_code 디버깅
  React.useEffect(() => {
    // 디버깅 로그 제거
  }, [origin_goods_code]);

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
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    handlePanelApply(e, t, setOrientation);
  }, [handlePanelApply, t, setOrientation]);

  // 썸네일 저장 함수 - 백엔드로 데이터 전송
  const handleSaveThumbnails = React.useCallback(async (originGoodsCode: string) => {
    // originGoodsCode가 없으면 origin_goods_code 사용
    const finalOriginGoodsCode = originGoodsCode || origin_goods_code;

    if (!finalOriginGoodsCode) {
      console.error('ThumbnailModal: originGoodsCode와 origin_goods_code 모두 없음');
      setToastMessage('origin_goods_code가 없습니다.');
      return;
    }

    try {
      // 편집된 이미지들을 ImageHost 서버에 업로드
      const uploadedUrls = await uploadEditedImages(thumbnails);

      const thumbnailData = {
        origin_goods_code: finalOriginGoodsCode,
        thumbnail_images: uploadedUrls
      };

      const response = await fetch('/save-goods-thumb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([thumbnailData])
      });

      if (response.ok) {
        const result = await response.json();
        setToastMessage('썸네일이 성공적으로 저장되었습니다.');
      } else {
        const errorText = await response.text();
        console.error('ThumbnailModal: 저장 실패', { status: response.status, statusText: response.statusText, errorText });
        setToastMessage('썸네일 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('ThumbnailModal: 저장 중 오류 발생', error);
      setToastMessage('썸네일 저장 중 오류가 발생했습니다.');
    }
  }, [thumbnails, origin_goods_code]);

  // 편집된 이미지를 ImageHost 서버에 업로드하는 함수
  const uploadEditedImages = async (images: string[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const image of images) {
      try {
        // Base64 이미지인지 URL인지 확인
        if (image.startsWith('data:image/')) {
          // Base64 이미지를 파일로 변환하여 ImageHost 서버에 업로드
          const response = await fetch('/imagehost/upload', {
            method: 'POST',
            body: createFormDataFromBase64(image)
          });

          if (response.ok) {
            const result = await response.json();
            uploadedUrls.push(result.data.url); // ImageHost 응답 구조에 맞춤
          } else {
            throw new Error('이미지 업로드 실패');
          }
        } else if (image.startsWith('http')) {
          // 외부 URL인 경우 그대로 사용
          uploadedUrls.push(image);
        } else {
          // 로컬 파일 경로인 경우 ImageHost 서버에 업로드
          const response = await fetch('/imagehost/upload', {
            method: 'POST',
            body: createFormDataFromFile(image)
          });

          if (response.ok) {
            const result = await response.json();
            uploadedUrls.push(result.data.url); // ImageHost 응답 구조에 맞춤
          } else {
            throw new Error('이미지 업로드 실패');
          }
        }
      } catch (error) {
        console.error('이미지 업로드 실패:', error);
        throw error;
      }
    }

    return uploadedUrls;
  };

  // Base64 이미지를 FormData로 변환하는 함수
  const createFormDataFromBase64 = (base64Image: string): FormData => {
    const formData = new FormData();

    // Base64를 Blob으로 변환
    const byteString = atob(base64Image.split(',')[1]);
    const mimeString = base64Image.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([ab], { type: mimeString });
    const file = new File([blob], `image_${Date.now()}.jpg`, { type: mimeString });

    formData.append('file', file);
    return formData;
  };

  // 로컬 파일을 FormData로 변환하는 함수
  const createFormDataFromFile = (filePath: string): FormData => {
    const formData = new FormData();
    // 파일 경로에서 파일 객체 생성 (실제 구현에서는 파일 객체를 직접 받아야 함)
    // 여기서는 임시로 빈 FormData 반환
    return formData;
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose}>
      {/* Toast 알림 */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      )}

      <ModalHeader title="썸네일 편집" onClose={onClose} />
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
                    onTagSet={() => { }}
                    onPanelApply={handlePanelApplyWrapper}
                    onStudio={() => { }}
                    onEditorPlus={() => { }}
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

                  onToggleEraser={() => {
                    // EditorMain의 Eraser 도구 토글 함수 호출
                    editorMainRef.current?.toggleEraser();
                  }}
                  onToggleLasso={() => {
                    // EditorMain의 Lasso 도구 토글 함수 호출
                    editorMainRef.current?.toggleLasso();
                  }}
                  isSquareLocked={isSquareLocked}

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
        <ThumbModalFooter
          onReset={resetImages}
          onSave={handleSaveThumbnails}
          originGoodsCode={origin_goods_code || ''}
        />
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
