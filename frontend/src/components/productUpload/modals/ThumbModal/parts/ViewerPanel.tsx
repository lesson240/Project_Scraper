// src/components/productUpload/thumbnailModal/parts/ViewerPanel.tsx
import React, { useEffect, useRef, useState } from "react";
import type { Rect } from "@/hooks/useSelectionRect";
import "@/styles/productUpload/editorCanvas.css";

type Orientation = { angle: number; flipX: boolean; flipY: boolean };

type Props = {
  image: string;
  crop?: Rect | null;        // 원본 픽셀 좌표
  orientation?: Orientation; // { angle(deg), flipX, flipY }
};

export default function ViewerPanel({ image, crop, orientation }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [ready, setReady] = useState(false);

  // 원본 이미지 로드
  useEffect(() => {
    if (!image) {
      imgRef.current = null;
      setReady(false);
      return;
    }

    const im = new Image();
    im.crossOrigin = "anonymous";
    setReady(false);

    // 최신 브라우저면 decode로 안정적으로 로드 보장
    im.onload = () => {
      imgRef.current = im;
      setReady(true);
    };
    // src 지정은 항상 마지막에
    im.src = image;

    return () => {
      imgRef.current = null;
      setReady(false);
    };
  }, [image]);

  // crop / orientation이 바뀔 때마다 다시 그림(이미지 준비 완료 시에만)
  useEffect(() => {
    if (ready) draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, crop, orientation]);

  const draw = () => {
    const im = imgRef.current;
    const cv = canvasRef.current;
    if (!im || !cv) return;
    if (!im.complete || im.naturalWidth === 0 || im.naturalHeight === 0) return;

    const ctx = cv.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, cv.width, cv.height);

    // 회전/플립 값
    const angleRad = ((orientation?.angle ?? 0) * Math.PI) / 180;
    const fx = orientation?.flipX ? -1 : 1;
    const fy = orientation?.flipY ? -1 : 1;

    // === 소스(오프스크린) 캔버스 준비 ===
    // 1) crop을 이미지 경계 내로 클램프 + 최소 1px 보장
    const iw = im.naturalWidth;
    const ih = im.naturalHeight;

    let sx = 0, sy = 0, sw = iw, sh = ih;
    if (crop && crop.w > 0 && crop.h > 0) {
      sx = Math.max(0, Math.floor(crop.x));
      sy = Math.max(0, Math.floor(crop.y));
      sw = Math.max(1, Math.floor(crop.w));
      sh = Math.max(1, Math.floor(crop.h));
      if (sx + sw > iw) sw = Math.max(1, iw - sx);
      if (sy + sh > ih) sh = Math.max(1, ih - sy);
    }

    // 2) 오프스크린 캔버스에 잘라 그리기
    if (sw <= 0 || sh <= 0) return; // 방어
    const srcCanvas = document.createElement("canvas");
    srcCanvas.width = sw;
    srcCanvas.height = sh;
    const sctx = srcCanvas.getContext("2d");
    if (!sctx) return;

    sctx.drawImage(im, sx, sy, sw, sh, 0, 0, sw, sh);

    // === 메인 캔버스에 contain 스케일로 중앙 배치 + 회전/플립 ===
    const cx = cv.width / 2;
    const cy = cv.height / 2;
    const scale = Math.min(cv.width / sw, cv.height / sh);
    if (!isFinite(scale) || scale <= 0) return;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angleRad);
    ctx.scale(fx, fy);
    ctx.scale(scale, scale);
    ctx.drawImage(srcCanvas, -sw / 2, -sh / 2);
    ctx.restore();
  };

  return (
    <div className="viewer-main">
      {/* 필요시 크기는 CSS에서 조정해도 됩니다. */}
      <canvas ref={canvasRef} width={200} height={200} />
    </div>
  );
}
