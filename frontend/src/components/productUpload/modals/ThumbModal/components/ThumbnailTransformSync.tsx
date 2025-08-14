import React, { useEffect, useRef } from 'react';
import type { Orientation } from '../lib/thumbnail.types';

type ThumbnailTransformSyncProps = {
    isOpen: boolean;
    isPanelApplyingRef: React.MutableRefObject<boolean>;
    t: any;
    orientation: Orientation;
    setOrientation: (orientation: Orientation) => void;
};

export default function ThumbnailTransformSync({
    isOpen,
    isPanelApplyingRef,
    t,
    orientation,
    setOrientation
}: ThumbnailTransformSyncProps) {
    // 무한 루프 방지를 위한 ref
    const lastSyncRef = useRef<Orientation>({ angle: 0, flipX: false, flipY: false });
    const isInitializedRef = useRef(false);

    // Modal 열릴 때 초기 transform 상태를 orientation에 동기화
    useEffect(() => {
        if (isOpen && !isInitializedRef.current) {
            // Modal이 열릴 때 현재 transform 상태를 orientation에 즉시 반영
            const initialOrientation = t.getOrientation();
            setOrientation(initialOrientation);
            lastSyncRef.current = initialOrientation;
            isInitializedRef.current = true;
        }
    }, [isOpen, t, setOrientation]);

    // 패널 적용 후 상태 동기화 감지 (무한 루프 방지)
    useEffect(() => {
        // 패널 적용이 완료된 후에만 동기화 감지
        if (!isPanelApplyingRef.current && isOpen && isInitializedRef.current) {
            const editorTransformState = t.state;
            const currentOrientation = orientation;

            // EditorMain과 Viewer 상태 비교
            const isSynchronized =
                editorTransformState.rotate === currentOrientation.angle &&
                editorTransformState.flipX === currentOrientation.flipX &&
                editorTransformState.flipY === currentOrientation.flipY;

            // 무한 루프 방지: 이전 동기화와 동일한 값이면 무시
            const newOrientation = {
                angle: editorTransformState.rotate,
                flipX: editorTransformState.flipX,
                flipY: editorTransformState.flipY
            };

            if (!isSynchronized &&
                (lastSyncRef.current.angle !== newOrientation.angle ||
                    lastSyncRef.current.flipX !== newOrientation.flipX ||
                    lastSyncRef.current.flipY !== newOrientation.flipY)) {

                // EditorMain 상태를 Viewer 상태와 동기화
                setOrientation(newOrientation);
                lastSyncRef.current = newOrientation;
            }
        }
    }, [isOpen, isPanelApplyingRef.current]); // 의존성 배열 단순화

    // 이 컴포넌트는 렌더링하지 않음 (로직만 담당)
    return null;
}
