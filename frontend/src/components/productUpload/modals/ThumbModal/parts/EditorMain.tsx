// src/components/productUpload/modals/ThumbModal/parts/EditorMain.tsx
// ✅ 메인 컴포넌트: 상태 관리 및 하위 컴포넌트 조합
// ✅ 이미지 변경 시 초기 선택 영역 설정
// ✅ transformTick으로 외부 변환 동기화

import React, { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from "react";
import { useCanvasTransform } from "@/hooks/useCanvasTransform";
import { useSelectionRect } from "@/hooks/useSelectionRect";
import EditorCanvas from "./EditorCanvas";
import EditorSelection from "./EditorSelection";
import EditorInteractions from "./EditorInteractions";
import EditorTransformSync from "./EditorTransformSync";
import EditorSpecialTools, { ToolType } from "./EditorSpecialTools";
import "@/styles/productUpload/editorCanvas.css";
import "@/styles/productUpload/editorSelection.css";
import "@/styles/productUpload/editorSpecialTools.css";

type Props = {
  image: string;
  onCropChange?: (r: { x: number; y: number; w: number; h: number } | null) => void;
  transform?: ReturnType<typeof useCanvasTransform>;
  transformTick?: number;
};

export interface EditorMainRef {
  toggleSquareLock: () => void;
  isSquareLocked: boolean;
  toggleEraser: () => void;
  toggleLasso: () => void;
  isEraserActive: boolean;
  isLassoActive: boolean;
  handleFillScreen: () => void;
  preserveSelection: () => void;
}

const EditorMain = forwardRef<EditorMainRef, Props>(({ image, onCropChange, transform, transformTick }, ref) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const hasInitRef = useRef(false);

  // 공용 transform 또는 내부 생성
  const own = useCanvasTransform();
  const tf = transform ?? own;
  const sel = useSelectionRect({
    onChange: onCropChange,
    preserveOnClear: true // 선택상자 해제 방지
  });

  // 특수 도구 상태
  const [activeTool, setActiveTool] = React.useState<ToolType | null>(null);

  // fillTheScreen 기능 구현
  const handleFillScreen = useCallback(() => {
    const host = stageRef.current;
    if (!host) {
      console.error('stageRef.current가 null입니다.');
      return;
    }

    // EditorMain의 실제 화면 크기 가져오기
    const rect = host.getBoundingClientRect();
    const stageWidth = rect.width;
    const stageHeight = rect.height;

    // 선택 상자를 화면 크기의 98.5%로 설정하고 정중앙에 배치
    const targetWidth = stageWidth * 0.985;
    const targetHeight = stageHeight * 0.985;

    // 스테이지의 절대 좌표를 기준으로 정중앙 계산
    // EditorSelection에서 stageRect.left, stageRect.top을 빼는 것을 고려
    const centerX = rect.left + (stageWidth / 2);
    const centerY = rect.top + (stageHeight / 2);

    // 선택박스의 좌상단 좌표 계산 (절대 좌표 기준)
    const newRect = {
      x: centerX - (targetWidth / 2),
      y: centerY - (targetHeight / 2),
      w: targetWidth,
      h: targetHeight
    };

    // setRect 호출
    try {
      sel.setRect(newRect);
    } catch (error) {
      console.error('setRect 호출 중 에러 발생:', error);

      // 에러 발생 시 DOM 직접 조작으로 대체
      setTimeout(() => {
        const selectBox = host.querySelector('.select-box');
        if (selectBox) {
          // EditorSelection의 좌표 변환을 고려하여 스타일 설정
          const relativeLeft = newRect.x - rect.left;
          const relativeTop = newRect.y - rect.top;

          (selectBox as HTMLElement).style.left = `${relativeLeft}px`;
          (selectBox as HTMLElement).style.top = `${relativeTop}px`;
          (selectBox as HTMLElement).style.width = `${newRect.w}px`;
          (selectBox as HTMLElement).style.height = `${newRect.h}px`;
        }
      }, 100);
    }
  }, [sel]);

  // 선택상자 해제 방지 및 버튼 클릭 시 선택상자 유지
  const preserveSelection = useCallback(() => {
    // 현재 선택상자가 있으면 유지
    if (sel.rect) {
      // 선택상자 상태를 임시로 저장했다가 복원
      const currentRect = sel.rect;
      // 약간의 지연 후 선택상자 복원 (transform 적용 후)
      setTimeout(() => {
        sel.setRect(currentRect);
      }, 10);
    }
  }, [sel]);

  // 정사각형 고정 토글 함수
  const toggleSquareLock = useCallback(() => {
    if (sel.toggleSquareLock) {
      sel.toggleSquareLock();
    }
  }, [sel]);

  // Pencil 도구 토글 함수 (기존 호환성 유지)
  const togglePencil = useCallback(() => {
    if (activeTool === 'pencil') {
      setActiveTool(null);
    } else {
      setActiveTool('pencil');
    }
  }, [activeTool]);

  // Eraser 도구 토글 함수
  const toggleEraser = useCallback(() => {
    const newState = activeTool === 'eraser' ? null : 'eraser';
    setActiveTool(newState);
  }, [activeTool]);

  // Lasso 도구 토글 함수
  const toggleLasso = useCallback(() => {
    const newState = activeTool === 'lasso' ? null : 'lasso';
    setActiveTool(newState);
  }, [activeTool]);

  // 특수 도구 완료 처리
  const handleToolComplete = useCallback((toolType: ToolType, data: any) => {
    if (!stageRef.current) return;

    // 도구별로 다른 처리 로직
    switch (toolType) {
      case 'pencil':
        // Pencil 도구: 그린 영역을 선택 영역으로 변환하지 않음
        break;

      case 'eraser':
        // Eraser 도구: 지워진 영역을 고려한 선택 영역 조정하지 않음
        break;

      case 'lasso':
        // Lasso 도구: 자유로운 영역 선택
        break;

      case 'magicWand':
        // Magic Wand 도구: 유사 색상 영역 선택 (향후 구현)
        break;

      default:
        break;
    }
  }, [activeTool]);

  // 이미지 변경 시 초기화 플래그 리셋
  useEffect(() => { hasInitRef.current = false; }, [image]);

  // 휠 이벤트 처리 - 모달 내부에서 줌 기능 작동
  useEffect(() => {
    const host = stageRef.current;
    if (!host) return;

    const handleWheel = (e: WheelEvent) => {
      // 모달 내부에서만 휠 이벤트 처리
      e.preventDefault();
      e.stopPropagation();

      // 휠 방향에 따라 줌 인/아웃
      if (e.deltaY < 0) {
        tf.zoomIn();
      } else {
        tf.zoomOut();
      }
    };

    // 휠 이벤트 리스너 추가
    host.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      host.removeEventListener('wheel', handleWheel);
    };
  }, [tf]);

  // 마우스 드래그로 줌 인/아웃 처리 (선택상자 내부에서도 동작)
  useEffect(() => {
    const host = stageRef.current;
    if (!host) return;

    let isDragging = false;
    let startY = 0;
    let startZoom = 0;

    const handleMouseDown = (e: MouseEvent) => {
      // 선택상자 내부에서도 마우스 이벤트 처리
      isDragging = true;
      startY = e.clientY;
      // 현재 줌 상태를 저장 (기본값 1)
      startZoom = 1;
      e.preventDefault();
      e.stopPropagation();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaY = e.clientY - startY;
      const zoomDelta = deltaY * 0.01; // 드래그 거리에 따른 줌 변화량

      if (Math.abs(zoomDelta) > 0.01) {
        // 줌 인/아웃을 여러 번 호출하여 부드러운 줌 효과 구현
        if (zoomDelta > 0) {
          tf.zoomOut();
        } else {
          tf.zoomIn();
        }
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    // 마우스 이벤트 리스너를 document에 추가하여 선택상자 내부에서도 동작
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [tf]);

  // 초기 80% 정사각형 선택 영역 설정
  useEffect(() => {
    const img = imgRef.current;
    const host = stageRef.current;
    if (!img || !host || !image) return;

    const onLoad = () => {
      if (hasInitRef.current) return;
      hasInitRef.current = true;

      const nw = img.naturalWidth || 1;
      const nh = img.naturalHeight || 1;
      const size = Math.round(0.8 * Math.min(nw, nh));

      const toS = (ix: number, iy: number) => tf.imageToScreen(ix, iy);
      const p1 = toS(nw / 2 - size / 2, nh / 2 + size / 2);
      const p2 = toS(nw / 2 + size / 2, nh / 2 - size / 2);
      const x = Math.min(p1.x, p2.x), y = Math.min(p1.y, p2.y);
      const w = Math.abs(p2.x - p1.x), h = Math.abs(p2.y - p1.y);
      sel.setRect({ x, y, w, h });
    };

    if (img.complete) onLoad();
    else {
      img.addEventListener("load", onLoad, { once: true });
      return () => img.removeEventListener("load", onLoad);
    }
  }, [image, tf, sel]);

  useImperativeHandle(ref, () => ({
    handleFillScreen: handleFillScreen,
    toggleSquareLock: toggleSquareLock, // 정사각형 고정 토글 함수 노출
    toggleEraser: toggleEraser, // Eraser 도구 토글 함수 노출
    toggleLasso: toggleLasso, // Lasso 도구 토글 함수 노출
    preserveSelection: preserveSelection, // 선택상자 유지 함수 노출
    isSquareLocked: sel.isSquareLocked || false, // 정사각형 고정 상태 노출
    isEraserActive: activeTool === 'eraser', // Eraser 도구 활성화 상태 노출
    isLassoActive: activeTool === 'lasso', // Lasso 도구 활성화 상태 노출
  }));

  return (
    <div className="editor-main">
      <EditorCanvas
        ref={stageRef}
        image={image}
        imgRef={imgRef}
        transform={tf}
      />
      <EditorSelection
        stageRef={stageRef}
        selection={sel}
        transform={tf}
      />
      <EditorInteractions
        stageRef={stageRef}
        transform={tf}
        selection={sel}
        onCropChange={onCropChange}
        activeTool={activeTool}
      />
      <EditorSpecialTools
        stageRef={stageRef}
        onToolComplete={handleToolComplete}
        activeTool={activeTool}
        onToolChange={setActiveTool}
      />
      <EditorTransformSync
        transform={tf}
        selection={sel}
        onCropChange={onCropChange}
        transformTick={transformTick}
        image={image}
      />
    </div>
  );
});

export default EditorMain;