import React from "react";
import Button from "@/components/common/Button";
import "@/styles/productUpload/thumbnailModal.css";


type FirstProps = {
  onLayerReset: () => void;
  onTagSet: () => void;
  onPanelApply: (e?: React.MouseEvent) => void;
  onStudio: () => void;
  onEditorPlus: () => void;
};

export function ThumbResultButtons({ onLayerReset, onPanelApply, onStudio, onEditorPlus }: FirstProps) {
  const handlePanelApply = () => {
    onPanelApply();
  };

  return (
    <div className="thumb-func-buttons">
      <Button variant="secondary" onClick={onLayerReset}>레이어 초기화</Button>
      <Button variant="primary" onClick={handlePanelApply}>패널 적용</Button>
      <Button variant="ninth" onClick={onStudio}>올땀 스튜디오</Button>
      <Button variant="third-rate" onClick={onEditorPlus}>에디터 +</Button>
    </div>
  );
}

// ThumbEditorButtons 컴포넌트 제거 (더 이상 사용하지 않음)
