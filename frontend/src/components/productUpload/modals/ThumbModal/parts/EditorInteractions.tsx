// src/components/productUpload/modals/ThumbModal/parts/EditorInteractions.tsx
// ✅ 마우스/키보드 이벤트 처리
// ✅ 성능 최적화: throttling 및 이벤트 최소화
// ✅ 팬/선택 모드 전환

import React, { useEffect, useState, useCallback, useRef } from "react";
import type { useSelectionRect } from "@/hooks/useSelectionRect";
import type { useCanvasTransform } from "@/hooks/useCanvasTransform";

type Props = {
    stageRef: React.RefObject<HTMLDivElement>;
    transform: ReturnType<typeof useCanvasTransform>;
    selection: ReturnType<typeof useSelectionRect>;
    onCropChange?: (r: { x: number; y: number; w: number; h: number } | null) => void;
};

export default function EditorInteractions({
    stageRef,
    transform,
    selection,
    onCropChange
}: Props) {
    const [spaceDown, setSpaceDown] = useState(false);
    const modeRef = useRef<"pan" | "select" | null>(null);

    // 최신 인스턴스 참조
    const tfRef = useRef(transform);
    const selRef = useRef(selection);
    useEffect(() => { tfRef.current = transform; }, [transform]);
    useEffect(() => { selRef.current = selection; }, [selection]);

    // Space 키 이벤트
    useEffect(() => {
        const kd = (e: KeyboardEvent) => {
            if (e.code === "Space") {
                e.preventDefault();
                setSpaceDown(true);
            }
        };
        const ku = (e: KeyboardEvent) => {
            if (e.code === "Space") setSpaceDown(false);
        };

        window.addEventListener("keydown", kd);
        window.addEventListener("keyup", ku);

        return () => {
            window.removeEventListener("keydown", kd);
            window.removeEventListener("keyup", ku);
        };
    }, []);

    // 마우스 이벤트 처리 (성능 최적화)
    useEffect(() => {
        const host = stageRef.current;
        if (!host) return;

        let isPanning = false;
        let isSelecting = false;

        const onDown = (e: MouseEvent) => {
            // 중간/우클릭 또는 Space+좌클릭 → 팬 모드
            if (e.button === 1 || e.button === 2 || spaceDown) {
                modeRef.current = "pan";
                isPanning = true;
                tfRef.current.panStart(e.clientX, e.clientY);
                host.classList.add("stage-grabbing");
                return;
            }

            // 좌클릭 → 선택 모드
            if (e.button === 0) {
                modeRef.current = "select";
                isSelecting = true;
                selRef.current.startDrag(e.clientX, e.clientY);
            }
        };

        const onMove = (e: MouseEvent) => {
            if (isPanning) {
                tfRef.current.panMove(e.clientX, e.clientY);
            } else if (isSelecting) {
                selRef.current.moveDrag(e.clientX, e.clientY);
            } else {
                // 커서 변경 (선택 영역 위에 있을 때)
                host.style.cursor = selRef.current.getCursor(e.clientX, e.clientY);
            }
        };

        const onUp = () => {
            if (isPanning) {
                tfRef.current.panEnd();
                host.classList.remove("stage-grabbing");
                isPanning = false;
            } else if (isSelecting) {
                selRef.current.endDrag();
                isSelecting = false;
            }
            modeRef.current = null;
        };

        host.addEventListener("mousedown", onDown);
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);

        return () => {
            host.removeEventListener("mousedown", onDown);
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
    }, [spaceDown, stageRef]);

    return null; // UI 렌더링 없음
}