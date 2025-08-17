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
    // 선택 상자 스타일 계산
    const selStyle = React.useMemo(() => {
        if (!selection.rect || !stageRef.current) {
            return null;
        }

        const stageRect = stageRef.current.getBoundingClientRect();
        const left = selection.rect.x - stageRect.left;
        const top = selection.rect.y - stageRect.top;
        const width = selection.rect.w;
        const height = selection.rect.h;

        return {
            left: `${left}px`,
            top: `${top}px`,
            width: `${width}px`,
            height: `${height}px`,
        };
    }, [selection.rect, stageRef]);

    // 선택 상자가 없으면 렌더링하지 않음
    if (!selection.rect) {
        return null;
    }

    return (
        <div className="select-box" style={selStyle}>
            {/* 핸들 요소들 */}
            <div className="handle nw" data-handle="nw" data-selection="handle"></div>
            <div className="handle n" data-handle="n" data-selection="handle"></div>
            <div className="handle ne" data-handle="ne" data-selection="handle"></div>
            <div className="handle e" data-handle="e" data-selection="handle"></div>
            <div className="handle se" data-handle="se" data-selection="handle"></div>
            <div className="handle s" data-handle="s" data-selection="handle"></div>
            <div className="handle sw" data-handle="sw" data-selection="handle"></div>
            <div className="handle w" data-handle="w" data-selection="handle"></div>
        </div>
    );
}