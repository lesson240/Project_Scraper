// src/components/productUpload/modals/ThumbModal/parts/ViewerCropHandler.tsx
// ✅ 크롭 좌표 계산
// ✅ 이미지 경계 검증

export default class ViewerCropHandler {
    static calculateCrop(
        image: HTMLImageElement,
        crop?: { x: number; y: number; w: number; h: number } | null
    ) {
        const iw = image.naturalWidth;
        const ih = image.naturalHeight;

        let sx = 0, sy = 0, sw = iw, sh = ih;

        if (crop && crop.w > 0 && crop.h > 0) {
            sx = Math.max(0, Math.floor(crop.x));
            sy = Math.max(0, Math.floor(crop.y));
            sw = Math.max(1, Math.floor(crop.w));
            sh = Math.max(1, Math.floor(crop.h));

            if (sx + sw > iw) sw = Math.max(1, iw - sx);
            if (sy + sh > ih) sh = Math.max(1, ih - sy);
        }

        return { sx, sy, sw, sh };
    }
}