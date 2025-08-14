// src/hooks/useCanvasTransform.ts
// ✅ 뷰 전환(팬/줌/회전/플립)과 좌표변환(이미지<->스크린), 정확한 역행렬 크롭 export 지원
// - connectStage(): 스테이지 엘리먼트(좌표 기준) 연결
// - connectTransform(): 변환 CSS 변수를 적용할 대상(대개 <img>) 연결
// - imageToScreen / screenToImage: 회전/플립/스케일/팬 포함한 정밀 변환
// - zoomAt(): 마우스 위치 고정 줌
// - onWheel(): 휠 줌 핸들러
// - exportSelection(): 현재 변환 상태를 반영해 정밀 크롭(썸네일 규격) 캔버스 생성
// - 회전은 누적(…→270→360→450…), 좌표 변환은 실제 각도(rotate % 360)로 처리

import React, { useCallback, useMemo, useRef, useState } from "react";

export type Orientation = { angle: number; flipX: boolean; flipY: boolean };
export type TransformState = {
  scale: number;   // 이미지 줌 배율
  tx: number;      // 화면(px) 기준 이동 X
  ty: number;      // 화면(px) 기준 이동 Y
  rotate: number;  // 누적 회전 각도(deg) - 0,90,180,270,360,450...
  flipX: boolean;
  flipY: boolean;
};

export type ScreenPoint = { x: number; y: number };
export type ImagePoint = { x: number; y: number };
export type ScreenRect = { x: number; y: number; w: number; h: number }; // 화면 좌표
export type ImageRect = { x: number; y: number; w: number; h: number };  // 원본(픽셀)

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export type ExportOptions = {
  width: number;             // 결과 캔버스 너비(px)
  height?: number;           // 지정 없으면 비율로 자동
  rounding?: "none" | "floor" | "round" | "ceil"; // 매트릭스/출력 반올림 옵션
  background?: string;       // 투명 아닌 배경색 필요시
};

export type UseCanvasTransformOptions = {
  onChange?: (state: TransformState) => void;
};

export function useCanvasTransform(opts: UseCanvasTransformOptions = {}) {
  const [state, setState] = useState<TransformState>({
    scale: 1,
    tx: 0,
    ty: 0,
    rotate: 0,
    flipX: false,
    flipY: false,
  });

  // 연결 대상
  const stageRef = useRef<HTMLElement | null>(null);
  const targetRef = useRef<HTMLElement | null>(null); // 보통 <img>

  // 팬 드래그용 임시 상태
  const panStartRef = useRef<{ mx: number; my: number; tx: number; ty: number } | null>(null);

  // CSS 변수 적용
  const applyCssVars = useCallback(() => {
    const el = targetRef.current as HTMLElement | null;
    if (!el) return;
    el.style.setProperty("--scale", String(state.scale));
    el.style.setProperty("--tx", `${state.tx}px`);
    el.style.setProperty("--ty", `${state.ty}px`);
    el.style.setProperty("--rot", `${state.rotate}deg`);
    el.style.setProperty("--flipX", state.flipX ? "-1" : "1");
    el.style.setProperty("--flipY", state.flipY ? "-1" : "1");
  }, [state.scale, state.tx, state.ty, state.rotate, state.flipX, state.flipY]);

  const commit = useCallback((patch: Partial<TransformState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      // CSS 즉시 반영 (setTimeout 제거)
      applyCssVars();
      return next;
    });

    // onChange를 setState 콜백 외부로 이동하여 즉시 호출
    const nextState = { ...state, ...patch };
    opts.onChange?.(nextState);
  }, [applyCssVars, opts.onChange, state]);

  // 연결
  const connectStage = useCallback((el: HTMLElement | null) => {
    stageRef.current = el;
  }, []);
  const connectTransform = useCallback((el: HTMLElement | null) => {
    targetRef.current = el;
    // 즉시 CSS 반영 (setTimeout 제거)
    applyCssVars();
  }, [applyCssVars]);

  // 회전/플립 상태는 state에서 관리됨 (orientRef 제거)

  // 외부에 제공할 게터
  const getOrientation = React.useCallback((): Orientation => {
    // state에서 실제 회전/반전 상태 가져오기
    const { rotate, flipX, flipY } = state;
    // 0/90/180/270 중 하나로 정규화
    const a = ((rotate % 360) + 360) % 360;
    return { angle: a, flipX, flipY };
  }, [state]);

  // 스타일 반영은 applyCssVars에서 처리됨

  // 회전/이동/확대/플립 (버튼/핫키용)
  const api = useMemo(() => ({
    // 이동
    moveLeft: () => commit({ tx: state.tx - 10 }),
    moveRight: () => commit({ tx: state.tx + 10 }),
    moveUp: () => commit({ ty: state.ty - 10 }),
    moveDown: () => commit({ ty: state.ty + 10 }),
    // 확대/축소
    zoomIn: () => commit({ scale: clamp(state.scale + 0.1, 0.1, 8) }),
    zoomOut: () => commit({ scale: clamp(state.scale - 0.1, 0.1, 8) }),
    fit: () => commit({ scale: 1, tx: 0, ty: 0, rotate: 0, flipX: false, flipY: false }),
    // 회전/반전 (누적)
    rotateLeft: () => commit({ rotate: state.rotate - 90 }),
    rotateRight: () => commit({ rotate: state.rotate + 90 }),
    flipH: () => commit({ flipX: !state.flipX }),
    flipV: () => commit({ flipY: !state.flipY }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [state, commit]);

  // ===== 행렬(이미지→스크린) 구성 =====
  // CSS와 동일한 순서: translate(tx,ty) → rotate(θ) → scale(fx*s, fy*s) → center 보정
  // 실제 화면 기준으로는 "스테이지 중앙"을 기준 원점으로 삼습니다.
  function buildMatrix(forState?: TransformState): DOMMatrix {
    const st = forState ?? state;
    const stage = stageRef.current;
    const target = targetRef.current as HTMLImageElement | null;
    if (!stage || !target) return new DOMMatrix();

    const stageRect = stage.getBoundingClientRect();
    const Cx = stageRect.left + stageRect.width / 2;
    const Cy = stageRect.top + stageRect.height / 2;

    // 이미지 레이아웃 크기(변환 전) - getBoundingClientRect는 transform 반영되므로 offsetWidth/Height 사용
    const w0 = (target as any).offsetWidth || target.naturalWidth || 1;
    const h0 = (target as any).offsetHeight || target.naturalHeight || 1;

    const natW = target.naturalWidth || w0;
    const natH = target.naturalHeight || h0;

    // 이미지 픽셀 → 엘리먼트 레이아웃(px)
    const sx0 = w0 / natW;
    const sy0 = h0 / natH;

    const fx = st.flipX ? -1 : 1;
    const fy = st.flipY ? -1 : 1;
    const s = st.scale;
    const θ = ((st.rotate % 360) + 360) % 360;

    let M = new DOMMatrix();
    // 스테이지 중앙으로 이동
    M = M.translate(Cx, Cy);
    // 팬
    M = M.translate(st.tx, st.ty);
    // 회전
    M = M.rotate(θ);
    // 플립 & 스케일
    M = M.scale(fx * s, fy * s);
    // 이미지 중심(0,0) 기준으로 만들기: -w0/2, -h0/2
    M = M.translate(-w0 / 2, -h0 / 2);
    // 이미지 픽셀 → 엘리먼트 레이아웃
    M = M.scale(sx0, sy0);
    return M;
  }

  // 변환 함수
  function imageToScreen(ix: number, iy: number, forState?: TransformState): ScreenPoint {
    const M = buildMatrix(forState);
    const p = new DOMPoint(ix, iy);
    const q = p.matrixTransform(M);
    return { x: q.x, y: q.y };
  }

  function screenToImage(sx: number, sy: number, forState?: TransformState): ImagePoint {
    const M = buildMatrix(forState);
    const inv = M.inverse();
    const p = new DOMPoint(sx, sy);
    const q = p.matrixTransform(inv);
    return { x: q.x, y: q.y };
  }

  // ===== 휠 줌(마우스 위치 고정) =====
  function zoomAt(clientX: number, clientY: number, factor: number) {
    const st = state;
    const P = screenToImage(clientX, clientY, st); // 현재 상태에서 포인터가 가리키는 이미지 좌표

    const nextScale = clamp(st.scale * factor, 0.1, 8);
    if (nextScale === st.scale) return;

    // scale만 바꾸고 동일 tx/ty 유지했을 때의 스크린 좌표
    const tmp: TransformState = { ...st, scale: nextScale };
    const S2 = imageToScreen(P.x, P.y, tmp);

    // 원하는 스크린(clientX, clientY)에 고정되도록 보정
    const dx = clientX - S2.x;
    const dy = clientY - S2.y;

    commit({ scale: nextScale, tx: st.tx + dx, ty: st.ty + dy });
  }

  function onWheel(e: WheelEvent) {
    if (!stageRef.current) return;
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    zoomAt(e.clientX, e.clientY, factor);
  }

  // ===== 팬 드래그 =====
  function panStart(mx: number, my: number) {
    panStartRef.current = { mx, my, tx: state.tx, ty: state.ty };
  }
  function panMove(mx: number, my: number) {
    const s = panStartRef.current;
    if (!s) return;
    const dx = mx - s.mx;
    const dy = my - s.my;
    commit({ tx: s.tx + dx, ty: s.ty + dy });
  }
  function panEnd() {
    panStartRef.current = null;
  }

  // ===== 현재 상태 기반: 화면 사각형(ScreenRect) → 원본(ImageRect) 근사(BBox) =====
  // ViewerPanel에서 drawImage(sx,sy,sw,sh) 형태로 쓰기 위해, 역행렬로 4점 변환 후 bounding box 반환
  function screenRectToImageBBox(r: ScreenRect): ImageRect {
    const p1 = screenToImage(r.x, r.y);
    const p2 = screenToImage(r.x + r.w, r.y);
    const p3 = screenToImage(r.x + r.w, r.y + r.h);
    const p4 = screenToImage(r.x, r.y + r.h);
    const xs = [p1.x, p2.x, p3.x, p4.x];
    const ys = [p1.y, p2.y, p3.y, p4.y];
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    return { x: Math.floor(minX), y: Math.floor(minY), w: Math.ceil(maxX - minX), h: Math.ceil(maxY - minY) };
  }

  // ===== 정확 Export: 선택(ScreenRect)이 최종 캔버스(0,0)-(W,H)에 정확히 떨어지도록 행렬 구성 후 그리기 =====
  // C = L * M,  where
  //  - M: image(px) -> screen(client px) (현재 상태 행렬)
  //  - L: screen -> selection-local (선택 좌상단을 (0,0), 선택 크기를 (W,H))
  async function exportSelection(
    imgEl: HTMLImageElement,
    sel: ScreenRect,
    opt: ExportOptions
  ): Promise<HTMLCanvasElement> {
    const W = opt.width;
    const H = opt.height ?? Math.round((W * sel.h) / sel.w);

    const rounding = opt.rounding ?? "none";
    const round = (v: number) =>
      rounding === "none" ? v :
        rounding === "floor" ? Math.floor(v) :
          rounding === "ceil" ? Math.ceil(v) : Math.round(v);

    const M = buildMatrix();
    // L: 선택영역 → (0,0)-(W,H)
    // 1) 선택 좌상단을 원점으로 이동  2) 선택 크기로 정규화  3) 타겟 해상도 스케일
    let L = new DOMMatrix();
    L = L.translate(-sel.x, -sel.y);
    L = L.scale(1 / sel.w, 1 / sel.h);
    L = L.scale(W, H);

    // C = L * M
    const C = L.multiply(M);

    const canvas = document.createElement("canvas");
    canvas.width = round(W);
    canvas.height = round(H);
    const ctx = canvas.getContext("2d")!;

    if (opt.background) {
      ctx.fillStyle = opt.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // setTransform(a, b, c, d, e, f) = [a c e; b d f; 0 0 1]
    ctx.setTransform(C.a, C.b, C.c, C.d, C.e, C.f);
    // 이미지 기준 좌표에서 그리면, C를 통해 정확히 캔버스에 투영됨
    ctx.drawImage(imgEl, 0, 0);

    // 반올림 보정(선택): 실제 픽셀 경계에 딱 맞추고 싶으면 추가 crop 가능
    return canvas;
  }

  return {
    state, commit,
    connectStage, connectTransform,
    imageToScreen, screenToImage,
    zoomAt, onWheel,
    panStart, panMove, panEnd,
    screenRectToImageBBox,
    exportSelection,
    getOrientation,
    ...api,
  };
}
