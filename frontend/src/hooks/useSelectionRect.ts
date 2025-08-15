// src/hooks/useSelectionRect.ts
// ✅ 화면(Screen) 좌표계에서 선택 사각형을 관리하고, 마우스/키보드(Shift/ESC) 인터랙션 제공
// - rect: 현재 선택(화면 좌표)
// - startDrag/moveDrag: 드래그 시작/이동
// - clear/setRect: 선택 초기화/설정
// - getCursor(): 핸들/내부/외부 커서 판단
// - 옵션 toImage를 통해 원본 좌표 Rect가 필요할 때 외부(예: EditorMain)에서 변환하여 사용

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type Rect = { x: number; y: number; w: number; h: number };

type Mode =
  | { type: "none" }
  | { type: "draw"; ox: number; oy: number }
  | { type: "move"; ox: number; oy: number; base: Rect }
  | { type: "resize"; handle: Handle; ox: number; oy: number; base: Rect };

type Handle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export type UseSelectionRectOptions = {
  // 원본 좌표가 필요할 때 외부에서 제공하는 변환(옵션)
  toImage?: (sx: number, sy: number) => { x: number; y: number };
  onChange?: (r: Rect | null) => void; // 선택 변경 콜백(화면 좌표 기준)
  stage?: HTMLElement | null;          // 커서 좌표 기준(옵션)
};

export function norm(r: Rect): Rect {
  const x = r.w >= 0 ? r.x : r.x + r.w;
  const y = r.h >= 0 ? r.y : r.y + r.h;
  const w = Math.abs(r.w), h = Math.abs(r.h);
  return { x, y, w, h };
}

export function useSelectionRect(opts: UseSelectionRectOptions = {}) {
  const [rect, setRectState] = useState<Rect | null>(null);
  const [isSquareLocked, setIsSquareLocked] = useState(false); // 정사각형 고정 상태
  const modeRef = useRef<Mode>({ type: "none" });
  const shiftRef = useRef(false);

  const setRect = useCallback((r: Rect | null) => {
    if (r) {
      const normalized = norm(r);
      setRectState(normalized);

      // onChange 콜백이 있는 경우에만 호출
      if (opts.onChange) {
        opts.onChange(normalized);
      }
    } else {
      setRectState(null);

      if (opts.onChange) {
        opts.onChange(null);
      }
    }
  }, [opts.onChange]); // rect 의존성 제거

  const clear = useCallback(() => setRect(null), [setRect]);

  // 정사각형 고정 토글 함수
  const toggleSquareLock = useCallback(() => {
    setIsSquareLocked(prev => !prev);
    // console.log('useSelectionRect: 정사각형 고정 토글:', !isSquareLocked); // 로그 제거
  }, [isSquareLocked]);

  // Shift: 정사각형 고정, ESC: 해제
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") shiftRef.current = true;
      if (e.key === "Escape") clear();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") shiftRef.current = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [clear]);

  // 내부/핸들 히트 테스트(화면 좌표)
  const hit = useCallback((sx: number, sy: number): { where: "outside" | "inside" | "handle"; handle?: Handle } => {
    if (!rect) return { where: "outside" };
    
    const r = rect;
    const pad = 8; // 핸들 히트 여유(픽셀) - 20px에서 8px로 복원
    const inX = sx >= r.x && sx <= r.x + r.w;
    const inY = sy >= r.y && sy <= r.y + r.h;
    
    console.log('useSelectionRect: hit 테스트:', { sx, sy, rect: r, inX, inY, pad });
    
    if (inX && inY) {
      // 핸들 영역(모서리/엣지) 우선 - 정확한 범위로 감지
      const near = (a: number, b: number) => Math.abs(a - b) <= pad;
      const left = near(sx, r.x), right = near(sx, r.x + r.w);
      const top = near(sy, r.y), bottom = near(sy, r.y + r.h);
      
      console.log('useSelectionRect: 핸들 감지:', { left, right, top, bottom, pad });
      
      if (top && left) {
        console.log('useSelectionRect: nw 핸들 감지됨');
        return { where: "handle", handle: "nw" };
      }
      if (top && right) {
        console.log('useSelectionRect: ne 핸들 감지됨');
        return { where: "handle", handle: "ne" };
      }
      if (bottom && right) {
        console.log('useSelectionRect: se 핸들 감지됨');
        return { where: "handle", handle: "se" };
      }
      if (bottom && left) {
        console.log('useSelectionRect: sw 핸들 감지됨');
        return { where: "handle", handle: "sw" };
      }
      if (top) {
        console.log('useSelectionRect: n 핸들 감지됨');
        return { where: "handle", handle: "n" };
      }
      if (right) {
        console.log('useSelectionRect: e 핸들 감지됨');
        return { where: "handle", handle: "e" };
      }
      if (bottom) {
        console.log('useSelectionRect: s 핸들 감지됨');
        return { where: "handle", handle: "s" };
      }
      if (left) {
        console.log('useSelectionRect: w 핸들 감지됨');
        return { where: "handle", handle: "w" };
      }
      
      console.log('useSelectionRect: 내부 영역 감지됨');
      return { where: "inside" };
    }
    
    console.log('useSelectionRect: 외부 영역 감지됨');
    return { where: "outside" };
  }, [rect]);

  const getCursor = useCallback((sx: number, sy: number) => {
    const h = hit(sx, sy);
    if (h.where === "handle") {
      switch (h.handle) {
        case "nw":
        case "se": return "nwse-resize";
        case "ne":
        case "sw": return "nesw-resize";
        case "n":
        case "s": return "ns-resize";
        case "e":
        case "w": return "ew-resize";
      }
    }
    if (h.where === "inside") return "move"; // hand like
    return "crosshair";
  }, [hit]);

  // 드래그 시작
  const startDrag = useCallback((sx: number, sy: number) => {
    console.log('useSelectionRect: startDrag 호출됨:', { sx, sy, rect, modeRef: modeRef.current });
    
    const h = hit(sx, sy);
    console.log('useSelectionRect: hit 결과:', h);
    
    if (!rect || h.where === "outside") {
      // 새 그리기
      console.log('useSelectionRect: 새 그리기 모드 설정');
      modeRef.current = { type: "draw", ox: sx, oy: sy };
      setRect({ x: sx, y: sy, w: 0, h: 0 });
      return;
    }
    if (h.where === "inside") {
      console.log('useSelectionRect: 이동 모드 설정');
      modeRef.current = { type: "move", ox: sx, oy: sy, base: rect };
      return;
    }
    if (h.where === "handle") {
      console.log('useSelectionRect: resize 모드 설정, handle:', h.handle);
      modeRef.current = { type: "resize", handle: h.handle!, ox: sx, oy: sy, base: rect };
      return;
    }
  }, [rect, setRect, hit]);

  // 드래그 이동
  const moveDrag = useCallback((sx: number, sy: number) => {
    const m = modeRef.current;
    console.log('useSelectionRect: moveDrag 호출됨:', { sx, sy, mode: m });
    
    if (m.type === "none") {
      console.log('useSelectionRect: 모드가 none이므로 처리하지 않음');
      return;
    }

    const squareIfShift = (x: number, y: number, w: number, h: number) => {
      // Shift 키 또는 정사각형 고정 상태일 때 정사각형 유지
      if (!shiftRef.current && !isSquareLocked) return { x, y, w, h };
      const size = Math.min(Math.abs(w), Math.abs(h));
      const ww = Math.sign(w) * size;
      const hh = Math.sign(h) * size;
      return { x, y, w: ww, h: hh };
    };

    if (m.type === "draw") {
      console.log('useSelectionRect: 그리기 모드 처리');
      const w = sx - m.ox, h = sy - m.oy;
      const r = squareIfShift(m.ox, m.oy, w, h);
      console.log('useSelectionRect: 그리기 결과:', r);
      setRect(r);
      return;
    }
    if (m.type === "move") {
      console.log('useSelectionRect: 이동 모드 처리');
      const dx = sx - m.ox, dy = sy - m.oy;
      const newRect = { x: m.base.x + dx, y: m.base.y + dy, w: m.base.w, h: m.base.h };
      console.log('useSelectionRect: 이동 결과:', { 원본: m.base, 변경: newRect });
      setRect(newRect);
      return;
    }
    if (m.type === "resize") {
      console.log('useSelectionRect: resize 모드 처리, handle:', m.handle);
      const dx = sx - m.ox, dy = sy - m.oy;
      let { x, y, w, h } = m.base;
      
      console.log('useSelectionRect: resize 시작 상태:', { x, y, w, h, dx, dy });
      
      switch (m.handle) {
        case "nw": 
          console.log('useSelectionRect: nw 핸들 처리');
          x += dx; y += dy; w -= dx; h -= dy; 
          break;
        case "n": 
          console.log('useSelectionRect: n 핸들 처리');
          y += dy; h -= dy; 
          break;
        case "ne": 
          console.log('useSelectionRect: ne 핸들 처리');
          y += dy; w += dx; h -= dy; 
          break;
        case "e": 
          console.log('useSelectionRect: e 핸들 처리');
          w += dx; 
          break;
        case "se": 
          console.log('useSelectionRect: se 핸들 처리');
          w += dx; h += dy; 
          break;
        case "s": 
          console.log('useSelectionRect: s 핸들 처리');
          h += dy; 
          break;
        case "sw": 
          console.log('useSelectionRect: sw 핸들 처리');
          x += dx; w -= dx; h += dy; 
          break;
        case "w": 
          console.log('useSelectionRect: w 핸들 처리');
          x += dx; w -= dx; 
          break;
      }
      
      console.log('useSelectionRect: resize 계산 후:', { x, y, w, h });
      
      const r = squareIfShift(x, y, w, h);
      console.log('useSelectionRect: resize 결과:', { 원본: m.base, 변경: r });
      setRect(r);
      return;
    }
  }, [setRect, isSquareLocked]);

  // 드래그 종료
  const endDrag = useCallback(() => {
    modeRef.current = { type: "none" };
  }, []);

  return {
    rect, setRect, clear,
    startDrag, moveDrag, endDrag,
    getCursor, toggleSquareLock, isSquareLocked,
  };
}
