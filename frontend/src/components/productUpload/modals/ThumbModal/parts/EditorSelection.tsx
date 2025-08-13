// src/components/productUpload/modals/ThumbModal/parts/EditorSelection.tsx
// ✅ 선택 영역 렌더링 및 스타일 계산
// ✅ 선택 박스 핸들 표시

import React, { useMemo } from "react";
import type { useSelectionRect } from "@/hooks/useSelectionRect";
import type { useCanvasTransform } from "@/hooks/useCanvasTransform";
import { norm } from "@/hooks/useSelectionRect";

type Props = {
    stageRef: React.RefObject<HTMLDivElement>;
    selection: ReturnType<typeof useSelectionRect>;
    transform: ReturnType<typeof useCanvasTransform>;
};

export default function EditorSelection({ stageRef, selection, transform }: Props) {
    // 선택박스 스타일 계산 (화면 좌표 → 스테이지 내부 좌표)
    const selStyle = useMemo(() => {
        if (!selection.rect || !stageRef.current) return undefined;

        const st = stageRef.current.getBoundingClientRect();
        const r = norm(selection.rect);

        return {
            left: `${r.x - st.left}px`,
            top: `${r.y - st.top}px`,
            width: `${r.w}px`,
            height: `${r.h}px`,
        } as React.CSSProperties;
    }, [selection.rect, stageRef]);

    if (!selection.rect) return null;

    return (
        <div className="select-layer">
            <div className="select-box" style={selStyle}>
                <div className="select-grid" />
                <div className="handle nw" />
                <div className="handle n" />
                <div className="handle ne" />
                <div className="handle e" />
                <div className="handle se" />
                <div className="handle s" />
                <div className="handle sw" />
                <div className="handle w" />
            </div>
        </div>
    );
}