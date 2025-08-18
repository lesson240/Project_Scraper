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
import apiConfig from "@/config/api";
import "@/styles/productUpload/thumbnailModal.css";
import { useCallback } from "react";

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
  // 패널 적용된 항목 추적
  const [modifiedSet, setModifiedSet] = React.useState<Set<number>>(new Set());

  // 호스팅된 이미지 URL인지 확인하는 함수
  const isHostedImage = useCallback((imageUrl: string): boolean => {
    return imageUrl.startsWith('http://localhost:8000') ||
      imageUrl.startsWith('https://') ||
      imageUrl.startsWith('blob:');
  }, []);

  // MongoDB에서 썸네일 메타데이터 조회하여 이미지 우선순위 설정
  const loadThumbnailMetadata = useCallback(async () => {
    if (!origin_goods_code) return;

    try {
      const response = await fetch(`${apiConfig.imageHostUrl}/get-thumbnails/${origin_goods_code}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data && result.data.thumbnail_images) {
          // R2 호스팅 이미지 우선, no-code/빈 값 제외
          const raw: string[] = result.data.thumbnail_images || [];
          const hostedImages = raw.filter(u => !!u && !u.includes('no-code'));
          const existingImages = thumbnails.filter(img => !isHostedImage(img));

          // 호스팅된 이미지 + 기존 이미지 순서로 결합
          const prioritizedImages = [...hostedImages, ...existingImages];

          // 중복 제거 (같은 URL이 있으면 하나만 유지)
          const uniqueImages = Array.from(new Set(prioritizedImages));

          // thumbnails 업데이트
          if (JSON.stringify(uniqueImages) !== JSON.stringify(thumbnails)) {
            updateThumbnails(uniqueImages);
          }
        }
      }
    } catch (error) {
      console.warn('썸네일 메타데이터 조회 실패:', error);
    }
  }, [origin_goods_code, thumbnails, updateThumbnails, isHostedImage]);

  // 모달이 열릴 때 메타데이터 로드 (중복 호출 방지)
  const loadedOnceRef = React.useRef(false);
  React.useEffect(() => {
    if (!isOpen) {
      loadedOnceRef.current = false;
      return;
    }
    if (isOpen && origin_goods_code && !loadedOnceRef.current) {
      loadedOnceRef.current = true;
      loadThumbnailMetadata();
    }
  }, [isOpen, origin_goods_code]);

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
    (index: number, newImageUrl: string) => {
      updateThumbnail(index, newImageUrl);
      setModifiedSet(prev => {
        const next = new Set(prev);
        next.add(index);
        return next;
      });
    }
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
  const handleImageSelect = useCallback((idx: number) => {
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

  // 이미지 우선순위 정렬 (호스팅된 이미지 우선)
  const sortImagesByPriority = useCallback((images: string[]): string[] => {
    return images.sort((a, b) => {
      const aIsHosted = isHostedImage(a);
      const bIsHosted = isHostedImage(b);

      if (aIsHosted && !bIsHosted) return -1;  // a가 호스팅된 이미지면 우선
      if (!aIsHosted && bIsHosted) return 1;   // b가 호스팅된 이미지면 우선
      return 0;  // 둘 다 호스팅된 이미지이거나 둘 다 아닌 경우 순서 유지
    });
  }, [isHostedImage]);

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
      // 패널 적용된 항목만 업로드
      const modifiedImages = thumbnails.filter((_, idx) => modifiedSet.has(idx));
      const uploadedUrls = await uploadEditedImages(modifiedImages, finalOriginGoodsCode);
      // 수정되지 않은 기존 호스팅 이미지는 유지
      const existingHosted = thumbnails.filter((url, idx) => !modifiedSet.has(idx) && url.startsWith('http'));
      const finalUrls = [...uploadedUrls, ...existingHosted];
      if (finalUrls.length === 0) {
        setToastMessage('저장할 이미지가 없습니다. 패널 적용 후 시도하세요.');
        return;
      }

      // FormData를 사용하여 썸네일 메타데이터 전송
      const formData = new FormData();
      formData.append('origin_goods_code', finalOriginGoodsCode);
      formData.append('thumbnail_images', JSON.stringify(finalUrls));
      formData.append('user_id', 'admin'); // 임시 사용자 ID
      formData.append('tags', JSON.stringify(['thumbnail', 'product']));
      formData.append('category', 'thumbnail');

      const response = await fetch(`${apiConfig.imageHostUrl}/save-thumbnail`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setToastMessage('썸네일이 성공적으로 저장되었습니다.');
        setModifiedSet(new Set());
        // onClose(); // 성공 시 모달 닫기 - 제거하여 모달이 열린 상태로 유지
      } else {
        const errorText = await response.text();
        console.error('ThumbnailModal: 저장 실패', { status: response.status, statusText: response.statusText, errorText });
        setToastMessage(`썸네일 저장에 실패했습니다. (${response.status})`);
      }
    } catch (error) {
      console.error('ThumbnailModal: 저장 중 오류 발생', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      setToastMessage(`썸네일 저장 중 오류: ${errorMessage}`);
    }
  }, [thumbnails, origin_goods_code, onClose, modifiedSet]);

  // 편집된 이미지를 ImageHost 서버에 업로드하는 함수
  const uploadEditedImages = async (images: string[], originGoodsCodeForUpload: string): Promise<string[]> => {
    console.log('=== uploadEditedImages 함수 시작 ===');
    console.log('받은 images 배열:', images);
    console.log('images 배열 길이:', images.length);
    console.log('첫 번째 이미지 타입:', typeof images[0]);
    console.log('첫 번째 이미지 내용:', images[0]);
    console.log('Base64 형식인가?', images[0]?.startsWith('data:image/'));

    const uploadedUrls: string[] = [];

    for (const image of images) {
      try {
        // Base64 이미지인지 URL인지 확인
        if (image.startsWith('data:image/')) {
          // Base64 이미지를 파일로 변환하여 ImageHost 서버에 업로드
          const formData = createFormDataFromBase64(image);
          formData.append('origin_goods_code', originGoodsCodeForUpload);
          formData.append('category', 'thumbnail');
          formData.append('user_id', 'admin');

          // API 호출 전 FormData 확인
          console.log('API 호출 전 FormData 확인:', {
            hasFile: formData.has('file'),
            entries: Array.from(formData.entries()),
            url: `${apiConfig.imageHostUrl}/upload`
          });

          const response = await fetch(`${apiConfig.imageHostUrl}/upload`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
            },
            body: formData
          });

          console.log('API 응답:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
          });

          if (response.ok) {
            const result = await response.json();
            console.log('API 성공 응답:', result);
            if (result.success && result.data && result.data.url) {
              // 로컬 개발 환경에서는 백엔드 서버의 URL을 사용
              const imageUrl = result.data.url.startsWith('/')
                ? `http://localhost:8000${result.data.url}`
                : result.data.url;
              uploadedUrls.push(imageUrl);
            } else {
              throw new Error('이미지 업로드 응답 형식 오류');
            }
          } else {
            const errorText = await response.text();
            console.error('API 오류 응답:', errorText);
            throw new Error(`이미지 업로드 실패: ${response.status} - ${errorText}`);
          }
        } else {
          // 외부 URL/Blob/로컬 파일을 서버로 업로드
          console.log('외부 URL 또는 Blob URL 처리 중...');

          const formData = await createFormDataFromFile(image);
          formData.append('origin_goods_code', originGoodsCodeForUpload);
          formData.append('category', 'thumbnail');
          formData.append('user_id', 'admin');

          // API 호출 전 FormData 확인
          console.log('외부 URL FormData 확인:', {
            hasFile: formData.has('file'),
            entries: Array.from(formData.entries())
          });

          const response = await fetch(`${apiConfig.imageHostUrl}/upload`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
            },
            body: formData
          });

          console.log('API 응답:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
          });

          if (response.ok) {
            const result = await response.json();
            console.log('API 성공 응답:', result);
            if (result.success && result.data && result.data.url) {
              // 로컬 개발 환경에서는 백엔드 서버의 URL을 사용
              const imageUrl = result.data.url.startsWith('/')
                ? `http://localhost:8000${result.data.url}`
                : result.data.url;
              uploadedUrls.push(imageUrl);
            } else {
              throw new Error('이미지 업로드 응답 형식 오류');
            }
          } else {
            const errorText = await response.text();
            console.error('API 오류 응답:', errorText);
            throw new Error(`이미지 업로드 실패: ${response.status} - ${errorText}`);
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

    try {
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

      // 디버깅 로그 추가
      console.log('FormData 생성 중:', {
        filename: file.name,
        size: file.size,
        type: file.type,
        base64Length: base64Image.length
      });

      formData.append('file', file);

      // FormData 내용 확인
      console.log('FormData 생성 완료:', {
        hasFile: formData.has('file'),
        entries: Array.from(formData.entries())
      });

      return formData;
    } catch (error) {
      console.error('FormData 생성 실패:', error);
      throw new Error(`FormData 생성 실패: ${error.message}`);
    }
  };

  // 로컬 파일을 FormData로 변환하는 함수
  const createFormDataFromFile = async (filePath: string): Promise<FormData> => {
    const formData = new FormData();

    try {
      console.log('createFormDataFromFile 호출됨:', filePath);

      // Blob URL인 경우
      if (filePath.startsWith('blob:')) {
        console.log('Blob URL 감지됨, File 객체로 변환 중...');

        // Blob URL에서 데이터 가져오기
        const response = await fetch(filePath);
        const blob = await response.blob();

        // File 객체 생성
        const file = new File([blob], `image_${Date.now()}.jpg`, { type: blob.type });

        console.log('Blob을 File로 변환 완료:', {
          filename: file.name,
          size: file.size,
          type: file.type
        });

        formData.append('file', file);
        return formData;
      }

      // 외부 URL인 경우
      if (filePath.startsWith('http')) {
        console.log('외부 URL 감지됨, 다운로드 중...');

        try {
          // 외부 이미지 다운로드
          const response = await fetch(filePath);
          const blob = await response.blob();

          // File 객체 생성
          const file = new File([blob], `image_${Date.now()}.jpg`, { type: blob.type });

          console.log('외부 이미지 다운로드 완료:', {
            filename: file.name,
            size: file.size,
            type: file.type
          });

          formData.append('file', file);
          return formData;
        } catch (error) {
          console.error('외부 이미지 다운로드 실패:', error);
          throw new Error(`외부 이미지 다운로드 실패: ${error.message}`);
        }
      }

      // 지원하지 않는 형식
      console.warn('지원하지 않는 파일 형식:', filePath);
      throw new Error(`지원하지 않는 파일 형식: ${filePath}`);

    } catch (error) {
      console.error('createFormDataFromFile 오류:', error);
      throw error;
    }
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
