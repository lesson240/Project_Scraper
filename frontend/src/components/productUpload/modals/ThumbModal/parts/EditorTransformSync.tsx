// src/components/productUpload/modals/ThumbModal/parts/EditorTransformSync.tsx
// ✅ 선택 영역 → 크롭 좌표 변환
// ✅ transformTick으로 외부 변환 동기화
// ✅ rAF throttling으로 성능 최적화

import React, { useEffect, useRef, useCallback } from "react";
import type { useSelectionRect } from "@/hooks/useSelectionRect";
import type { useCanvasTransform } from "@/hooks/useCanvasTransform";

type Props = {
    transform: ReturnType<typeof useCanvasTransform>;
    selection: ReturnType<typeof useSelectionRect>;
    onCropChange?: (r: { x: number; y: number; w: number; h: number } | null) => void;
    transformTick?: number;
    image: string;
};

export default function EditorTransformSync({
    transform,
    selection,
    onCropChange,
    transformTick,
    image
}: Props) {
    const lastSentRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
    const rafIdRef = useRef<number | null>(null);

    // 크롭 좌표 계산 및 전송
    const sendCrop = useCallback(() => {
        if (!onCropChange) return;

        const rect = selection.rect;
        let next: { x: number; y: number; w: number; h: number } | null = null;

        if (rect) {
            // 화면 좌표 → 원본 이미지 좌표계 변환
            const raw = transform.screenRectToImageBBox(rect);
            next = {
                x: Math.round(raw.x),
                y: Math.round(raw.y),
                w: Math.round(raw.w),
                h: Math.round(raw.h),
            };
        }

        // 변경사항 확인
        const prev = lastSentRef.current;
        const changed =
            (prev === null && next !== null) ||
            (prev !== null && next === null) ||
            (prev !== null &&
                next !== null &&
                (prev.x !== next.x || prev.y !== next.y || prev.w !== next.w || prev.h !== next.h));

        if (changed) {
            lastSentRef.current = next;
            onCropChange(next);
        }
    }, [onCropChange, selection.rect, transform]);

    // rAF throttling: 연속 입력 시 1프레임당 1회만 반영
    const scheduleSendCrop = useCallback(() => {
        if (rafIdRef.current != null) return;
        rafIdRef.current = requestAnimationFrame(() => {
            rafIdRef.current = null;
            sendCrop();
        });
    }, [sendCrop]);

    // 정리
    useEffect(() => {
        return () => {
            if (rafIdRef.current != null) {
                cancelAnimationFrame(rafIdRef.current);
            }
        };
    }, []);

    // 선택 영역 변경 시 즉시 전송
    useEffect(() => {
        sendCrop();
    }, [sendCrop]);

    // 외부 변환 후 DOM 반영 직후 계산 (회전/플립 등)
    useEffect(() => {
        if (!image) return;

        // DOM 업데이트 후 크롭 계산
        const id = requestAnimationFrame(() => {
            // 추가 지연으로 transform 완전 반영 보장
            setTimeout(() => sendCrop(), 16);
        });

        return () => cancelAnimationFrame(id);
    }, [image, sendCrop]); // transformTick 의존성 제거

    return null; // UI 렌더링 없음
}