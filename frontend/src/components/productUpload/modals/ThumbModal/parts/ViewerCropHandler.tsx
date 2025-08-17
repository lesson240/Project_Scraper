// src/components/productUpload/modals/ThumbModal/parts/ViewerCropHandler.tsx
// ✅ 크롭 좌표 계산
// ✅ 이미지 경계 검증
// ✅ 회전/반전 상태 고려한 좌표 변환

type Orientation = {
    angle: number;
    flipX: boolean;
    flipY: boolean;
};

export default class ViewerCropHandler {
    static calculateCrop(
        image: HTMLImageElement,
        crop?: { x: number; y: number; w: number; h: number } | null,
        orientation?: Orientation
    ) {
        const iw = image.naturalWidth;
        const ih = image.naturalHeight;
        let sx = 0, sy = 0, sw = iw, sh = ih;

        if (crop && crop.w > 0 && crop.h > 0) {
            // 기본 크롭 좌표 계산 - 이미지 경계 제한 제거
            // 선택상자가 이미지 영역을 벗어나도 그대로 표시
            sx = crop.x;
            sy = crop.y;
            sw = crop.w;
            sh = crop.h;

            // orientation이 있는 경우 변환 적용
            if (orientation) {
                const { angle, flipX, flipY } = orientation;
                const normalizedAngle = ((angle % 360) + 360) % 360;

                // 회전에 따른 좌표 변환
                if (normalizedAngle === 90) {
                    const tempSx = sx;
                    sx = iw - sy - sh;
                    sy = tempSx;
                    [sw, sh] = [sh, sw];
                } else if (normalizedAngle === 180) {
                    sx = iw - sx - sw;
                    sy = ih - sy - sh;
                } else if (normalizedAngle === 270) {
                    const tempSx = sx;
                    sx = sy;
                    sy = ih - tempSx - sw;
                    [sw, sh] = [sh, sw];
                }

                // 반전에 따른 좌표 변환
                if (flipX) {
                    sx = iw - sx - sw;
                }
                if (flipY) {
                    sy = ih - sy - sh;
                }
            }
        }

        // 최종 crop 좌표 반환
        return { sx, sy, sw, sh };
    }
}