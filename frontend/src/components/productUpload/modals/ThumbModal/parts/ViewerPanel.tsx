// src/components/productUpload/modals/ThumbModal/parts/ViewerPanel.tsx
// ✅ 메인 컴포넌트: 상태 관리 및 하위 컴포넌트 조합
// ✅ orientation 변경 감지 및 디버깅

import React, { useMemo } from "react";
import ViewerImageLoader from "./ViewerImageLoader";
import ViewerCanvas from "./ViewerCanvas";
import "@/styles/productUpload/editorCanvas.css";

type Orientation = {
  angle: number;
  flipX: boolean;
  flipY: boolean;
};

type Props = {
  image: string;
  crop?: { x: number; y: number; w: number; h: number } | null;
  orientation?: Orientation;
};

export default function ViewerPanel({ image, crop, orientation }: Props) {
  // orientation 기본값 처리 및 메모이제이션
  const safeOrientation = useMemo(() => ({
    angle: orientation?.angle ?? 0,
    flipX: orientation?.flipX ?? false,
    flipY: orientation?.flipY ?? false
  }), [orientation]);

  // 디버깅: orientation 변경 감지
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // console.log('ViewerPanel: Orientation changed to:', safeOrientation);
    }
  }, [safeOrientation]);

  return (
    <div className="viewer-panel">
      {image ? (
        <ViewerImageLoader image={image}>
          {(imgRef, ready) => (
            <ViewerCanvas
              imgRef={imgRef}
              ready={ready}
              crop={crop}
              orientation={safeOrientation}
            />
          )}
        </ViewerImageLoader>
      ) : (
        <div className="no-image">이미지를 선택하세요</div>
      )}
    </div>
  );
}