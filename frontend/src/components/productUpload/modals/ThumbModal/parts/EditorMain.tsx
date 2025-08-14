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
import "@/styles/productUpload/editorCanvas.css";
import "@/styles/productUpload/editorSelection.css";

type Props = {
  image: string;
  onCropChange?: (r: { x: number; y: number; w: number; h: number } | null) => void;
  transform?: ReturnType<typeof useCanvasTransform>;
  transformTick?: number;
};

export interface EditorMainRef {
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

    // 선택 상자를 화면 전체로 설정 (화면 좌표계 기준)
    // 약간의 여백을 두어 선택 상자가 완전히 보이도록 함
    const margin = 10;
    const newRect = {
      x: margin,
      y: margin,
      w: stageWidth - (margin * 2),
      h: stageHeight - (margin * 2)
    };

    console.log('새로운 선택 상자 설정:', newRect);
    console.log('현재 selection.rect:', sel.rect);

    // 방법 1: setRect 시도 (더 안전한 방식)
    try {
      console.log('setRect 호출 시도...');
      sel.setRect(newRect);
      console.log('setRect 호출 완료');
    } catch (error) {
      console.error('setRect 호출 중 에러 발생:', error);
    }

    // 방법 2: 강제로 상태 업데이트 (setRect가 작동하지 않는 경우)
    setTimeout(() => {
      console.log('setTimeout 100ms 후 상태 확인:', sel.rect);

      if (sel.rect !== newRect) {
        console.log('setRect가 작동하지 않음, 강제 업데이트 시도');

        try {
          // useSelectionRect의 내부 상태를 직접 업데이트
          sel.setRect(newRect);
          console.log('강제 업데이트 setRect 호출 완료');
        } catch (error) {
          console.error('강제 업데이트 setRect 에러:', error);
        }

        // 여전히 작동하지 않으면 다른 방법 시도
        setTimeout(() => {
          console.log('setTimeout 200ms 후 상태 확인:', sel.rect);

          if (sel.rect !== newRect) {
            console.log('강제 업데이트도 실패, DOM 직접 조작 시도');

            try {
              // DOM에서 직접 선택 상자 스타일 업데이트
              const selectBox = host.querySelector('.select-box');
              if (selectBox) {
                (selectBox as HTMLElement).style.left = `${newRect.x}px`;
                (selectBox as HTMLElement).style.top = `${newRect.y}px`;
                (selectBox as HTMLElement).style.width = `${newRect.w}px`;
                (selectBox as HTMLElement).style.height = `${newRect.h}px`;
                console.log('DOM 직접 조작 완료');
              } else {
                console.error('select-box 요소를 찾을 수 없음');
              }
            } catch (error) {
              console.error('DOM 직접 조작 중 에러:', error);
            }
          }
        }, 100);
      } else {
        console.log('setRect가 성공적으로 작동함!');
      }
    }, 100);

    console.log('선택 상자 설정 완료');
  }, [sel]);

  // 이미지 변경 시 초기화 플래그 리셋
  useEffect(() => { hasInitRef.current = false; }, [image]);

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