import { useCallback, useRef, useState, useMemo } from 'react';
import { useCanvasTransform } from '@/hooks/useCanvasTransform';
import type { Orientation, TransformState } from '../types/thumbnail.types';

export const useThumbnailTransform = (isPanelApplyingRef: React.MutableRefObject<boolean>) => {
    // 무한 루프 방지: useRef로 이전 transform 상태 추적
    const prevTransformStateRef = useRef<any>(null);

    // transform 상태 변경 완료 추적
    const isTransformStableRef = useRef(true);

    // orientation 상태
    const [orientation, setOrientation] = useState<Orientation>({
        angle: 0,
        flipX: false,
        flipY: false
    });

    // onChange 콜백을 동적으로 생성하여 패널 적용 중에는 비활성화
    const onChangeCallback = useCallback((newState: any) => {
        // 패널 적용 실행 중이면 완전히 무시
        if (isPanelApplyingRef.current) {
            return;
        }

        // 추가 안전장치: 패널 적용 상태 재확인
        if (isPanelApplyingRef.current) {
            return;
        }

        // 추가 안전장치: transform state 자체 변경 차단
        if (isPanelApplyingRef.current) {
            return;
        }

        // transform 상태 변경 시작
        isTransformStableRef.current = false;

        // 이전 상태와 비교하여 실제 변경사항이 있을 때만 처리
        if (prevTransformStateRef.current) {
            const prev = prevTransformStateRef.current;

            // 회전/반전만 감지 - crop/scale/pan 변경은 무시
            const hasRotationOrFlipChanged =
                prev.rotate !== newState.rotate ||
                prev.flipX !== newState.flipX ||
                prev.flipY !== newState.flipY;

            if (!hasRotationOrFlipChanged) {
                // 변경사항이 없으면 상태 안정화
                isTransformStableRef.current = true;
                return; // 회전/반전 변경사항이 없으면 아무것도 하지 않음
            }
        }

        // 현재 상태를 이전 상태로 저장 (회전/반전만)
        prevTransformStateRef.current = {
            rotate: newState.rotate,
            flipX: newState.flipX,
            flipY: newState.flipY
        };

        // transform 상태가 변경될 때마다 orientation 즉시 동기화
        const newOrientation = {
            angle: ((newState.rotate % 360) + 360) % 360,
            flipX: newState.flipX,
            flipY: newState.flipY
        };

        // 패널 적용 중에는 setOrientation 호출 자체를 차단
        if (!isPanelApplyingRef.current) {
            setOrientation(newOrientation);

            // 동기화 보장: EditorMain과 Viewer 상태 일치 확인
            const editorTransformState = t.state;
            const isCurrentlySynchronized =
                editorTransformState.rotate === newOrientation.angle &&
                editorTransformState.flipX === newOrientation.flipX &&
                editorTransformState.flipY === newOrientation.flipY;

            if (!isCurrentlySynchronized) {
                // 강제로 EditorMain 상태를 Viewer 상태와 동기화
                setOrientation(newOrientation);
            }
        }

        // 상태 변경 완료 후 안정화 신호
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                isTransformStableRef.current = true;
            });
        });
    }, [isPanelApplyingRef]);

    // onChange 옵션을 useMemo로 동적 생성하여 패널 적용 중 완전 차단
    const onChangeOptions = useMemo(() => ({
        onChange: isPanelApplyingRef.current ? undefined : onChangeCallback
    }), [isPanelApplyingRef.current, onChangeCallback]);

    // useCanvasTransform 훅 사용
    const t = useCanvasTransform(onChangeOptions);

    // 패널 적용 중에는 orientation 변경을 차단하는 setter
    const safeSetOrientation = useCallback((newOrientation: Orientation) => {
        if (isPanelApplyingRef.current) {
            return;
        }
        setOrientation(newOrientation);
    }, [isPanelApplyingRef.current]);

    // bumpTick 함수 단순화 - onChange 콜백이 이미 동기화를 처리
    const bumpTick = useCallback(() => {
        // Transform 변경은 onChange 콜백에서 처리됨
    }, []);

    return {
        t,
        orientation,
        setOrientation,
        safeSetOrientation,
        bumpTick,
        isTransformStableRef,
        prevTransformStateRef
    };
};
