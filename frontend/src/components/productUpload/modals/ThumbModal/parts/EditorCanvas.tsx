// src/components/productUpload/modals/ThumbModal/parts/EditorCanvas.tsx
// ✅ 캔버스 렌더링 전용 컴포넌트
// ✅ 이미지 표시 및 transform 연결
// ✅ 휠 줌 이벤트 처리

import React, { forwardRef, useEffect } from "react";
import type { useCanvasTransform } from "@/hooks/useCanvasTransform";

type Props = {
    image: string;
    imgRef: React.RefObject<HTMLImageElement>;
    transform: ReturnType<typeof useCanvasTransform>;
};

const EditorCanvas = forwardRef<HTMLDivElement, Props>(
    ({ image, imgRef, transform }, stageRef) => {
        // 스테이지 연결
        useEffect(() => {
            const host = stageRef as React.RefObject<HTMLDivElement>;
            if (!host?.current) return;
            transform.connectStage(host.current);
        }, [transform, stageRef]);

        // transform 대상 연결 (CSS 변수 갱신)
        useEffect(() => {
            const el = imgRef.current;
            if (!el) return;
            transform.connectTransform(el);
            return () => transform.connectTransform(null);
        }, [transform, imgRef]);

        // 휠 줌 이벤트
        useEffect(() => {
            const host = stageRef as React.RefObject<HTMLDivElement>;
            if (!host?.current) return;

            const onWheel = (e: WheelEvent) => {
                transform.onWheel(e);
            };
            host.current.addEventListener("wheel", onWheel, { passive: false });

            // 컨텍스트 메뉴 비활성화
            const onCtx = (e: MouseEvent) => e.preventDefault();
            host.current.addEventListener("contextmenu", onCtx);

            return () => {
                if (host.current) {
                    host.current.removeEventListener("wheel", onWheel);
                    host.current.removeEventListener("contextmenu", onCtx);
                }
            };
        }, [transform, stageRef]);

        return (
            <div className="canvas-stage" ref={stageRef}>
                {image ? (
                    <img
                        ref={imgRef}
                        className="editor-canvas-img"
                        src={image}
                        alt="canvas"
                        draggable={false}
                    />
                ) : (
                    <div>이미지를 선택하세요</div>
                )}
            </div>
        );
    }
);

EditorCanvas.displayName = "EditorCanvas";
export default EditorCanvas;