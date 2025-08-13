// src/components/productUpload/modals/ThumbModal/parts/EditorMain.tsx
// ✅ 메인 컴포넌트: 상태 관리 및 하위 컴포넌트 조합
// ✅ 이미지 변경 시 초기 선택 영역 설정
// ✅ transformTick으로 외부 변환 동기화

import React, { useEffect, useRef } from "react";
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

export default function EditorMain({ image, onCropChange, transform, transformTick }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const hasInitRef = useRef(false);

  // 공용 transform 또는 내부 생성
  const own = useCanvasTransform();
  const tf = transform ?? own;
  const sel = useSelectionRect();

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
}