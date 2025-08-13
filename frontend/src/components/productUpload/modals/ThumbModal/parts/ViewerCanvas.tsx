// src/components/productUpload/modals/ThumbModal/parts/ViewerCanvas.tsx
// ✅ Canvas 요소 관리
// ✅ 크기 및 스타일 설정

import React, { useMemo } from "react";
import ViewerTransformRenderer from "./ViewerTransformRenderer";

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
};

export default function ViewerCanvas({ imgRef, ready, crop, orientation }: Props) {
    // Canvas 스타일 메모이제이션
    const canvasStyle = useMemo(() => ({
        width: '100%',
        height: '100%',
        display: 'block'
    }), []);

    return (
        <ViewerTransformRenderer
            imgRef={imgRef}
            ready={ready}
            crop={crop}
            orientation={orientation}
            canvasStyle={canvasStyle}
        />
    );
}