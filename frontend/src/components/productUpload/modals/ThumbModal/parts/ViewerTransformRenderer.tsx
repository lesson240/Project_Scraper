// src/components/productUpload/modals/ThumbModal/parts/ViewerTransformRenderer.tsx
// ✅ 이미지 변환 및 렌더링
// ✅ 회전/플립/크롭 처리

import React, { useEffect, useRef, useCallback, useState } from "react";
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
    const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);

    // orientation 변경 시 즉시 재그리기
    useEffect(() => {
        if (ready) {
            draw();
        } else {
            setFallbackUrl(null);
        }
    }, [ready, crop, orientation]);

    const draw = useCallback(() => {
        const im = imgRef.current;
        const cv = canvasRef.current;
        if (!im || !cv) return;
        if (!im.complete || im.naturalWidth === 0 || im.naturalHeight === 0) return;

        const ctx = cv.getContext("2d");
        if (!ctx) return;

        try {
            // 캔버스를 흰색으로 초기화
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, cv.width, cv.height);

            // 회전/플립 값
            const angleRad = (orientation.angle * Math.PI) / 180;
            const fx = orientation.flipX ? -1 : 1;
            const fy = orientation.flipY ? -1 : 1;

            // 크롭 처리
            const { sx, sy, sw, sh } = ViewerCropHandler.calculateCrop(im, crop, orientation);

            // 오프스크린 캔버스에 잘라 그리기
            const srcCanvas = document.createElement("canvas");
            srcCanvas.width = sw;
            srcCanvas.height = sh;
            const sctx = srcCanvas.getContext("2d");
            if (!sctx) return;

            // 오프스크린 캔버스를 흰색으로 초기화
            sctx.fillStyle = '#ffffff';
            sctx.fillRect(0, 0, sw, sh);

            // 실제 이미지 영역만 그리기
            const actualSx = Math.max(0, sx);
            const actualSy = Math.max(0, sy);
            const actualSw = Math.min(sw, im.naturalWidth - actualSx);
            const actualSh = Math.min(sh, im.naturalHeight - actualSy);

            if (actualSw > 0 && actualSh > 0) {
                sctx.drawImage(im, actualSx, actualSy, actualSw, actualSh,
                    Math.max(0, -sx), Math.max(0, -sy), actualSw, actualSh);
            }

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

            if (sx < 0 || sy < 0 || sx + sw > im.naturalWidth || sy + sh > im.naturalHeight) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(-sw / 2, -sh / 2, sw, sh);
            }

            ctx.drawImage(srcCanvas, -sw / 2, -sh / 2);
            ctx.restore();
            setFallbackUrl(null);
        } catch (err) {
            // CORS로 인한 canvas 보안 에러 등 발생 시 이미지 태그로 대체 렌더링
            setFallbackUrl(im.src || null);
        }

    }, [imgRef, crop, orientation]);

    if (fallbackUrl) {
        return (
            <img src={fallbackUrl} alt="viewer-fallback" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        );
    }

    return (
        <canvas
            ref={canvasRef}
            width={200}
            height={200}
            style={canvasStyle}
        />
    );
}