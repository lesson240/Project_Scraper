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
        if (!selection.rect || !stageRef.current) {
            console.log('EditorSelection: selection.rect 또는 stageRef가 없음', {
                hasRect: !!selection.rect,
                hasStageRef: !!stageRef.current
            });
            return undefined;
        }

        const st = stageRef.current.getBoundingClientRect();
        const r = norm(selection.rect);

        const computedStyle = {
            left: `${r.x - st.left}px`,
            top: `${r.y - st.top}px`,
            width: `${r.w}px`,
            height: `${r.h}px`,
        };

        console.log('EditorSelection: 선택 상자 스타일 계산', {
            originalRect: selection.rect,
            normalizedRect: r,
            stageRect: st,
            computedStyle
        });

        return computedStyle as React.CSSProperties;
    }, [selection.rect, stageRef]);

    if (!selection.rect) {
        console.log('EditorSelection: selection.rect가 null이므로 렌더링하지 않음');
        return null;
    }

    console.log('EditorSelection: 선택 상자 렌더링', { rect: selection.rect, style: selStyle });
    
    // 핸들 상태 디버깅
    console.log('EditorSelection: 핸들 요소들 확인:', {
      hasSelectLayer: !!document.querySelector('.select-layer'),
      hasSelectBox: !!document.querySelector('.select-box'),
      hasSelectGrid: !!document.querySelector('.select-grid'),
      handles: document.querySelectorAll('.handle'),
      handleCount: document.querySelectorAll('.handle').length,
      handleClasses: Array.from(document.querySelectorAll('.handle')).map(h => h.className)
    });

    return (
        <div className="select-layer" data-selection="layer">
            <div className="select-box" style={selStyle} data-selection="box">
                <div className="select-grid" data-selection="grid" />
                <div className="handle nw" data-selection="handle" data-handle="nw" />
                <div className="handle n" data-selection="handle" data-handle="n" />
                <div className="handle ne" data-selection="handle" data-handle="ne" />
                <div className="handle e" data-selection="handle" data-handle="e" />
                <div className="handle se" data-selection="handle" data-handle="se" />
                <div className="handle s" data-selection="handle" data-handle="s" />
                <div className="handle sw" data-selection="handle" data-handle="sw" />
                <div className="handle w" data-selection="handle" data-handle="w" />
            </div>
        </div>
    );
}