// src/components/productUpload/modals/ThumbModal/parts/ViewerTransformRenderer.tsx
// ✅ 이미지 변환 및 렌더링
// ✅ 회전/플립/크롭 처리

import React, { useEffect, useRef, useCallback } from "react";
import ViewerCropHandler from "./ViewerCropHandler";

type Orientation = {
    angle: number;
    flipX: boolean;
    flipY: boolean;
};

type Props = {
    imgRef: React.RefObject<HTMLImageElement>;
    ready: boolean;
    crop?: { x: number; y: number; w: number; h: number } | null;
    orientation: Orientation;
    canvasStyle: React.CSSProperties;
};

export default function ViewerTransformRenderer({
    imgRef,
    ready,
    crop,
    orientation,
    canvasStyle
}: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // orientation 변경 시 즉시 재그리기
    useEffect(() => {
        if (ready) {
            // console.log('ViewerTransformRenderer: Redrawing with orientation:', orientation);
            draw();
        }
    }, [ready, crop, orientation]);

    const draw = useCallback(() => {
        const im = imgRef.current;
        const cv = canvasRef.current;
        if (!im || !cv) return;
        if (!im.complete || im.naturalWidth === 0 || im.naturalHeight === 0) return;

        const ctx = cv.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, cv.width, cv.height);

        // 회전/플립 값
        const angleRad = (orientation.angle * Math.PI) / 180;
        const fx = orientation.flipX ? -1 : 1;
        const fy = orientation.flipY ? -1 : 1;

        // console.log('ViewerTransformRenderer: Drawing with:', {
        //     angle: orientation.angle,
        //     flipX: orientation.flipX,
        //     flipY: orientation.flipY
        // });

        // 크롭 처리
        const { sx, sy, sw, sh } = ViewerCropHandler.calculateCrop(im, crop);

        // 오프스크린 캔버스에 잘라 그리기
        const srcCanvas = document.createElement("canvas");
        srcCanvas.width = sw;
        srcCanvas.height = sh;
        const sctx = srcCanvas.getContext("2d");
        if (!sctx) return;

        sctx.drawImage(im, sx, sy, sw, sh, 0, 0, sw, sh);

        // 메인 캔버스에 변환 적용
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
    }, [imgRef, crop, orientation]);

    return (
        <canvas
            ref={canvasRef}
            width={200}
            height={200}
            style={canvasStyle}
        />
    );
}