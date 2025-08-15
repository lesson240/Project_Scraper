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
  toggleBrush: () => void;
  toggleEraser: () => void;
  toggleLasso: () => void;
  isBrushActive: boolean;
  isEraserActive: boolean;
  isLassoActive: boolean;
  handleFillScreen: () => void;
}

const EditorMain = forwardRef<EditorMainRef, Props>(({ image, onCropChange, transform, transformTick }, ref) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const hasInitRef = useRef(false);

  // 공용 transform 또는 내부 생성
  const own = useCanvasTransform();
  const tf = transform ?? own;
  const sel = useSelectionRect({
    onChange: onCropChange
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

    console.log('fillTheScreen 실행:', { stageWidth, stageHeight, rect });

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

    console.log('새로운 선택 상자 설정 (98.5% 크기, 정중앙):', {
      stageSize: { width: stageWidth, height: stageHeight },
      stageRect: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom },
      center: { x: centerX, y: centerY },
      targetSize: { width: targetWidth, height: targetHeight },
      finalRect: newRect
    });
    console.log('현재 selection.rect:', sel.rect);

    // setRect 호출
    try {
      console.log('setRect 호출 시도...');
      sel.setRect(newRect);
      console.log('setRect 호출 완료');
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
          console.log('DOM 직접 조작 완료 (상대 좌표 적용)');
        }
      }, 100);
    }

    console.log('선택 상자 설정 완료 (98.5% 크기, 정중앙 위치)');
  }, [sel]);

  // 정사각형 고정 토글 함수
  const toggleSquareLock = useCallback(() => {
    if (sel.toggleSquareLock) {
      sel.toggleSquareLock();
      console.log('EditorMain: 정사각형 고정 토글 실행');
    }
  }, [sel]);

  // Pencil 도구 토글 함수 (기존 호환성 유지)
  const togglePencil = useCallback(() => {
    if (activeTool === 'pencil') {
      setActiveTool(null);
              } else {
      setActiveTool('pencil');
    }
    console.log('EditorMain: Pencil 도구 토글 실행', activeTool === 'pencil' ? '비활성화' : '활성화');
  }, [activeTool]);

  // Brush 도구 토글 함수
  const toggleBrush = useCallback(() => {
    const newState = activeTool === 'brush' ? null : 'brush';
    console.log('EditorMain: Brush 도구 토글 실행:', { 
      이전상태: activeTool, 
      새로운상태: newState 
    });
    setActiveTool(newState);
    
    // 강제 리렌더링을 위한 상태 업데이트
    if (newState) {
      console.log('EditorMain: Brush 도구 활성화 - 강제 리렌더링 트리거');
      // 약간의 지연 후 상태 확인
      setTimeout(() => {
        console.log('EditorMain: Brush 도구 상태 확인:', { 
          activeTool: newState, 
          timestamp: Date.now() 
        });
      }, 100);
    }
  }, [activeTool]);

  // Eraser 도구 토글 함수
  const toggleEraser = useCallback(() => {
    const newState = activeTool === 'eraser' ? null : 'eraser';
    console.log('EditorMain: Eraser 도구 토글 실행:', { 
      이전상태: activeTool, 
      새로운상태: newState 
    });
    setActiveTool(newState);
    
    // 강제 리렌더링을 위한 상태 업데이트
    if (newState) {
      console.log('EditorMain: Eraser 도구 활성화 - 강제 리렌더링 트리거');
      setTimeout(() => {
        console.log('EditorMain: Eraser 도구 상태 확인:', { 
          activeTool: newState, 
          timestamp: Date.now() 
        });
      }, 100);
    }
  }, [activeTool]);

  // Lasso 도구 토글 함수
  const toggleLasso = useCallback(() => {
    const newState = activeTool === 'lasso' ? null : 'lasso';
    console.log('EditorMain: Lasso 도구 토글 실행:', { 
      이전상태: activeTool, 
      새로운상태: newState 
    });
    setActiveTool(newState);
    
    // 강제 리렌더링을 위한 상태 업데이트
    if (newState) {
      console.log('EditorMain: Lasso 도구 활성화 - 강제 리렌더링 트리거');
      setTimeout(() => {
        console.log('EditorMain: Lasso 도구 상태 확인:', { 
          activeTool: newState, 
          timestamp: Date.now() 
        });
        }, 100);
    }
  }, [activeTool]);

  // 특수 도구 완료 처리
  const handleToolComplete = useCallback((toolType: ToolType, data: any) => {
    if (!stageRef.current) return;
    
    // 도구별로 다른 처리 로직
    switch (toolType) {
      case 'pencil':
        // Pencil 도구: 그린 영역을 선택 영역으로 변환하지 않음
        console.log('Pencil 도구 완료:', data);
        // ✅ 선택상자 강제 변경 제거 - 사용자가 그린 영역 그대로 유지
        // ✅ sel.setRect() 호출하지 않음 - 기존 선택상자 크기 유지
        // ✅ viewer에 그린 내용 연동
        break;
        
      case 'brush':
        // Brush 도구: 그린 영역을 선택 영역으로 변환하지 않음
        console.log('Brush 도구 완료:', data);
        // ✅ 선택상자 강제 변경 제거 - 사용자가 그린 영역 그대로 유지
        // ✅ sel.setRect() 호출하지 않음 - 기존 선택상자 크기 유지
        // ✅ viewer에 그린 내용 연동
        break;
        
      case 'eraser':
        // Eraser 도구: 지워진 영역을 고려한 선택 영역 조정하지 않음
        console.log('Eraser 도구 완료:', data);
        // ✅ Eraser는 선택 영역을 변경하지 않고 그린 내용만 지움
        // ✅ sel.setRect() 호출하지 않음 - 기존 선택상자 크기 유지
        // ✅ viewer에 지워진 내용 연동
        break;
        
      case 'lasso':
        // Lasso 도구: 자유로운 영역 선택
        console.log('Lasso 도구 완료:', data);
        // ✅ 선택상자 강제 변경 제거 - 사용자가 그린 영역 그대로 유지
        // ✅ sel.setRect() 호출하지 않음 - 기존 선택상자 크기 유지
        // ✅ viewer에 선택된 영역 연동 (자유도형)
        break;
        
      case 'magicWand':
        // Magic Wand 도구: 유사 색상 영역 선택 (향후 구현)
        console.log('Magic Wand 도구 완료:', data);
        break;
        
      default:
        console.log('알 수 없는 도구:', toolType, data);
    }
    
    // ✅ 도구 자동 비활성화 제거 - 사용자가 직접 끄기 전까지 계속 사용 가능
    // ✅ setActiveTool(null) 호출하지 않음 - 도구 상태 유지
    // ✅ 선택상자 강제 변경 없음 - 기존 크기 그대로 유지
    // ✅ 그린 내용은 viewer에 연동되어 계속 표시
    console.log('EditorMain: 도구 완료 처리 완료, 선택상자 변경 없음, 도구 상태 유지, viewer 연동:', activeTool);
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
      
      console.log('EditorMain: 휠 이벤트 감지됨:', {
        deltaY: e.deltaY,
        clientX: e.clientX,
        clientY: e.clientY,
        target: e.target
      });

      // 휠 방향에 따라 줌 인/아웃
      if (e.deltaY < 0) {
        console.log('EditorMain: 줌 인 실행');
        tf.zoomIn();
      } else {
        console.log('EditorMain: 줌 아웃 실행');
        tf.zoomOut();
      }
    };

    // 휠 이벤트 리스너 추가
    host.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      host.removeEventListener('wheel', handleWheel);
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
    toggleBrush: toggleBrush, // Brush 도구 토글 함수 노출
    toggleEraser: toggleEraser, // Eraser 도구 토글 함수 노출
    toggleLasso: toggleLasso, // Lasso 도구 토글 함수 노출
    isSquareLocked: sel.isSquareLocked || false, // 정사각형 고정 상태 노출
    isBrushActive: activeTool === 'brush', // Brush 도구 활성화 상태 노출
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