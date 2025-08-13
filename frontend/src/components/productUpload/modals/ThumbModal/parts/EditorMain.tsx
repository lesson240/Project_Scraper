// src/components/productUpload/thumbnailModal/parts/EditorMain.tsx
// ✅ 휠 줌/드래그 팬/Shift 정사각형/ESC 해제
// ✅ 회전·플립/줌/팬 후 Viewer 즉시 동기화
// ✅ 이미지 변경 시에만 초기 80% 선택 사각형 1회 생성
// ✅ connectStage + connectTransform (CSS 변수 기반 transform)

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useCanvasTransform } from "@/hooks/useCanvasTransform";
import { useSelectionRect, Rect, norm } from "@/hooks/useSelectionRect";
import "@/styles/productUpload/editorCanvas.css";
import "@/styles/productUpload/editorSelection.css";

type Props = {
  image: string;
  onCropChange?: (r: { x: number; y: number; w: number; h: number } | null) => void;
  /** 외부에서 전달되는 공용 transform (없으면 내부 생성) */
  transform?: ReturnType<typeof useCanvasTransform>;
  /** 컨트롤 버튼 동작 뒤 강제 동기화용 */
  transformTick?: number;
};

export default function EditorMain({ image, onCropChange, transform, transformTick }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const lastSentRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const hasInitRef = useRef(false);

  // 1) 뷰 변환(휠 줌/팬/회전/플립 등)
  const own = useCanvasTransform();
  const tf = transform ?? own;

  // 2) 선택 영역(화면 좌표)
  const sel = useSelectionRect();

  // 최신 인스턴스를 리스너에서 쓰기 위한 ref
  const tfRef = useRef(tf);
  const selRef = useRef(sel);
  useEffect(() => { tfRef.current = tf; }, [tf]);
  useEffect(() => { selRef.current = sel; }, [sel]);

  // --- Viewer에 보낼 크롭 계산 ---
  const sendCrop = useCallback(() => {
    if (!onCropChange) return;

    const rect = sel.rect;
    let next: { x: number; y: number; w: number; h: number } | null = null;

    if (rect) {
      // 화면 좌표 선택 사각형 → 원본 이미지 좌표계 BBox
      const raw = tf.screenRectToImageBBox(rect);
      next = {
        x: Math.round(raw.x),
        y: Math.round(raw.y),
        w: Math.round(raw.w),
        h: Math.round(raw.h),
      };
    }

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
  }, [onCropChange, sel.rect, tf]);

  // rAF-throttle: 줌/팬 등 연속 입력 동안 1프레임당 1회만 반영
  const rafIdRef = useRef<number | null>(null);
  const scheduleSendCrop = useCallback(() => {
    if (rafIdRef.current != null) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      sendCrop();
    });
  }, [sendCrop]);
  useEffect(() => () => { if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current); }, []);

  // Space로 팬 시작 (UX)
  const [spaceDown, setSpaceDown] = useState(false);
  useEffect(() => {
    const kd = (e: KeyboardEvent) => { if (e.code === "Space") { e.preventDefault(); setSpaceDown(true); } };
    const ku = (e: KeyboardEvent) => { if (e.code === "Space") setSpaceDown(false); };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => { window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); };
  }, []);

  // 3) 스테이지 연결 & 휠 줌
  useEffect(() => {
    const host = stageRef.current;
    if (!host) return;

    tf.connectStage(host);

    const onWheel = (e: WheelEvent) => {
      tf.onWheel(e);
      scheduleSendCrop(); // ✅ 줌 후 1프레임에 한 번만 반영
    };
    host.addEventListener("wheel", onWheel, { passive: false });

    // 컨텍스트 메뉴 비활성(우클릭 팬)
    const onCtx = (e: MouseEvent) => e.preventDefault();
    host.addEventListener("contextmenu", onCtx);

    return () => {
      host.removeEventListener("wheel", onWheel);
      host.removeEventListener("contextmenu", onCtx);
    };
  }, [tf, scheduleSendCrop]);

  // 4) 변환 대상 연결(CSS 변수 갱신)
  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    tf.connectTransform(el);
    return () => tf.connectTransform(null);
  }, [tf]);

  // 5) 마우스 인터랙션: 좌클릭 선택/리사이즈/이동, Middle/Right or Space+좌클릭 → 팬
  useEffect(() => {
    const host = stageRef.current!;
    let mode: "pan" | "select" | null = null;

    const onDown = (e: MouseEvent) => {
      if (e.button === 1 || e.button === 2 || spaceDown) {
        mode = "pan";
        tfRef.current.panStart(e.clientX, e.clientY);
        host.classList.add("stage-grabbing");
        return;
      }
      if (e.button === 0) {
        mode = "select";
        selRef.current.startDrag(e.clientX, e.clientY);
      }
    };
    const onMove = (e: MouseEvent) => {
      if (mode === "pan") {
        tfRef.current.panMove(e.clientX, e.clientY);
        scheduleSendCrop(); // ✅ 이동 중에도 rAF로 묶어서 반영
      } else if (mode === "select") {
        selRef.current.moveDrag(e.clientX, e.clientY);
      } else {
        host.style.cursor = selRef.current.getCursor(e.clientX, e.clientY);
      }
    };
    const onUp = () => {
      if (mode === "pan") {
        tfRef.current.panEnd();
        host.classList.remove("stage-grabbing");
        scheduleSendCrop(); // ✅ 팬 종료 시 확정 반영
      } else if (mode === "select") {
        selRef.current.endDrag();
      }
      mode = null;
    };

    host.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      host.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [spaceDown, scheduleSendCrop]);

  // 6) 이미지 로드 시: 초기 80% 정사각형 선택 (이미지 바뀔 때 1회)
  useEffect(() => { hasInitRef.current = false; }, [image]); // 새 이미지면 초기화 플래그 리셋

  useEffect(() => {
    const img = imgRef.current;
    const host = stageRef.current;
    if (!img || !host || !image) return;

    const onLoad = () => {
      if (hasInitRef.current) return; // 이미 했으면 패스
      hasInitRef.current = true;

      const nw = img.naturalWidth || 1;
      const nh = img.naturalHeight || 1;
      const size = Math.round(0.8 * Math.min(nw, nh));

      const toS = (ix: number, iy: number) => tf.imageToScreen(ix, iy);
      const p1 = toS(nw / 2 - size / 2, nh / 2 - size / 2);
      const p2 = toS(nw / 2 + size / 2, nh / 2 + size / 2);
      const x = Math.min(p1.x, p2.x), y = Math.min(p1.y, p2.y);
      const w = Math.abs(p2.x - p1.x), h = Math.abs(p2.y - p1.y);
      sel.setRect({ x, y, w, h });
    };

    if (img.complete) onLoad();
    else {
      img.addEventListener("load", onLoad, { once: true });
      return () => img.removeEventListener("load", onLoad);
    }
  }, [image, tf, sel]);

  // 7) 선택/변환이 바뀔 때 Viewer에 전달
  // ▸ 선택 영역 바뀌면 즉시
  useEffect(() => { sendCrop(); }, [sendCrop]);

  // ▸ 컨트롤 버튼 동작 뒤(회전/플립 등) DOM 반영 직후 계산
  useEffect(() => {
    if (!image) return;
    const id = requestAnimationFrame(() => sendCrop());
    return () => cancelAnimationFrame(id);
  }, [transformTick, image, sendCrop]);

  // 선택박스는 "화면 좌표"를 "스테이지 내부 좌표"로 환산해 배치
  const selStyle = useMemo(() => {
    if (!sel.rect || !stageRef.current) return undefined;
    const st = stageRef.current.getBoundingClientRect();
    const r = norm(sel.rect);
    return {
      left: `${r.x - st.left}px`,
      top: `${r.y - st.top}px`,
      width: `${r.w}px`,
      height: `${r.h}px`,
    } as React.CSSProperties;
  }, [sel.rect]);

  return (
    <div className="editor-main">
      <div className="canvas-stage" ref={stageRef}>
        {image ? (
          <>
            <img
              ref={imgRef}
              className="editor-canvas-img"
              src={image}
              alt="canvas"
              draggable={false}
            />
            {sel.rect && (
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
            )}
          </>
        ) : (
          <div>이미지를 선택하세요</div>
        )}
      </div>
    </div>
  );
}
