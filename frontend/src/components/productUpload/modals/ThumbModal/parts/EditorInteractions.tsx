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
    
    // 이벤트 디바운싱을 위한 ref
    const moveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

        // 마우스 드래그 줌 기능 추가
        let dragStartY = 0;
        let isZoomDragging = false;

        const onDown = (e: MouseEvent) => {
          // 중간/우클릭 또는 Space+좌클릭 → 팬 모드
          if (e.button === 1 || e.button === 2 || spaceDown) {
            e.preventDefault();
            e.stopPropagation();
            modeRef.current = "pan";
            isPanning = true;
            tfRef.current.panStart(e.clientX, e.clientY);
            host.classList.add("stage-grabbing");
            return;
          }

          // 좌클릭 → 선택 모드 또는 줌 모드
          if (e.button === 0) {
            const target = e.target as HTMLElement;
            console.log('EditorInteractions: 클릭된 요소:', {
              className: target.className,
              tagName: target.tagName,
              id: target.id,
              classList: Array.from(target.classList)
            });
            
            // 선택박스 핸들 클릭 시 (resize 모드)
            if (target.classList.contains('handle') || target.hasAttribute('data-selection') && target.getAttribute('data-selection') === 'handle') {
              // 핸들 타입을 더 정확하게 식별
              let handleType = target.getAttribute('data-handle');
              if (!handleType) {
                // classList에서 handle을 제외한 클래스명 찾기
                const classes = Array.from(target.classList);
                handleType = classes.find(c => c !== 'handle' && ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].includes(c));
              }
              
              // 핸들 타입이 여전히 없으면 부모 요소에서 찾기
              if (!handleType && target.parentElement) {
                const parent = target.parentElement;
                if (parent.classList.contains('select-box')) {
                  // 부모가 select-box인 경우, target의 위치로 핸들 타입 추정
                  const rect = target.getBoundingClientRect();
                  const parentRect = parent.getBoundingClientRect();
                  
                  // 위치 기반으로 핸들 타입 추정
                  const isLeft = rect.left <= parentRect.left + 20;
                  const isRight = rect.right >= parentRect.right - 20;
                  const isTop = rect.top <= parentRect.top + 20;
                  const isBottom = rect.bottom >= parentRect.bottom - 20;
                  
                  if (isTop && isLeft) handleType = 'nw';
                  else if (isTop && isRight) handleType = 'ne';
                  else if (isBottom && isRight) handleType = 'se';
                  else if (isBottom && isLeft) handleType = 'sw';
                  else if (isTop) handleType = 'n';
                  else if (isRight) handleType = 'e';
                  else if (isBottom) handleType = 's';
                  else if (isLeft) handleType = 'w';
                }
              }
              
              console.log('EditorInteractions: 핸들 클릭됨 - resize 모드:', {
                handleType,
                className: target.className,
                dataHandle: target.getAttribute('data-handle'),
                classList: Array.from(target.classList),
                target: target,
                parentElement: target.parentElement?.className
              });
              
              if (handleType) {
                e.preventDefault();
                e.stopPropagation();
                modeRef.current = "select";
                isSelecting = true;
                selRef.current.startDrag(e.clientX, e.clientY);
                console.log('EditorInteractions: resize 모드 설정됨 - 핸들:', handleType);
                return;
              } else {
                console.log('EditorInteractions: 핸들 타입을 식별할 수 없음 - 클릭된 요소:', target);
              }
            } 
            // 선택박스 내부 클릭 시 (이동 모드)
            else if (target.classList.contains('select-box') || target.classList.contains('select-grid') || target.classList.contains('select-layer') || 
                     target.hasAttribute('data-selection') && ['box', 'grid', 'layer'].includes(target.getAttribute('data-selection') || '')) {
              console.log('EditorInteractions: 선택박스 내부 클릭됨 - 이동 모드');
              e.preventDefault();
              e.stopPropagation();
              modeRef.current = "select";
              isSelecting = true;
              selRef.current.startDrag(e.clientX, e.clientY);
              console.log('EditorInteractions: 이동 모드 설정됨');
              return;
            } 
            // 일반 영역 클릭 시 (줌 모드 또는 그리기 모드)
            else {
              // 일반 영역에서 Ctrl+드래그 시 줌 모드
              if (e.ctrlKey || e.metaKey) {
                console.log('EditorInteractions: Ctrl+클릭 - 줌 모드 시작');
                e.preventDefault();
                e.stopPropagation();
                isZoomDragging = true;
                dragStartY = e.clientY;
                return;
              }
              
              console.log('EditorInteractions: 일반 영역 클릭됨 - 그리기 모드');
              modeRef.current = "select";
              isSelecting = true;
              selRef.current.startDrag(e.clientX, e.clientY);
              console.log('EditorInteractions: 그리기 모드 설정됨');
            }
          }
        };

        const onMove = (e: MouseEvent) => {
          // 줌 드래그 모드 처리
          if (isZoomDragging) {
            e.preventDefault();
            e.stopPropagation();
            
            const deltaY = e.clientY - dragStartY;
            const zoomFactor = deltaY > 0 ? 0.95 : 1.05; // 위로 드래그 시 줌 인, 아래로 드래그 시 줌 아웃
            
            console.log('EditorInteractions: 줌 드래그 처리:', { deltaY, zoomFactor });
            
            if (Math.abs(deltaY) > 10) { // 10px 이상 움직였을 때만 줌 적용
              if (zoomFactor > 1) {
                tfRef.current.zoomIn();
              } else {
                tfRef.current.zoomOut();
              }
              dragStartY = e.clientY; // 새로운 시작점 설정
            }
            return;
          }
          
          if (isPanning) {
            console.log('EditorInteractions: 팬 모드로 이동 처리');
            tfRef.current.panMove(e.clientX, e.clientY);
          } else if (isSelecting) {
            console.log('EditorInteractions: 선택 모드로 이동 처리, modeRef:', modeRef.current);
            selRef.current.moveDrag(e.clientX, e.clientY);
          } else {
            // 디바운싱된 커서 변경 (성능 최적화)
            if (moveTimeoutRef.current) {
              clearTimeout(moveTimeoutRef.current);
            }
            
            moveTimeoutRef.current = setTimeout(() => {
              const cursor = selRef.current.getCursor(e.clientX, e.clientY);
              host.style.cursor = cursor;
            }, 16); // 약 60fps로 제한
          }
        };

        const onUp = () => {
          if (isZoomDragging) {
            console.log('EditorInteractions: 줌 드래그 모드 종료');
            isZoomDragging = false;
          } else if (isPanning) {
            console.log('EditorInteractions: 팬 모드 종료');
            tfRef.current.panEnd();
            host.classList.remove("stage-grabbing");
            isPanning = false;
          } else if (isSelecting) {
            console.log('EditorInteractions: 선택 모드 종료');
            selRef.current.endDrag();
            isSelecting = false;
          }
          modeRef.current = null;
        };

        // 이벤트 리스너를 document 레벨로 확장하여 선택박스 이벤트 캡처
        document.addEventListener("mousedown", onDown);
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);

        return () => {
            document.removeEventListener("mousedown", onDown);
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
            
            // 타임아웃 정리
            if (moveTimeoutRef.current) {
                clearTimeout(moveTimeoutRef.current);
            }
        };
    }, [spaceDown, stageRef]);

    return null; // UI 렌더링 없음
}