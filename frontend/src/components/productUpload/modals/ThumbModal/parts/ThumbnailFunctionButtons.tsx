import React from "react";
import Button from "@/components/common/Button";
import "@/styles/productUpload/thumbnailModal.css";


type FirstProps = {
  onLayerReset: () => void;
  onTagSet: () => void;
  onPanelApply: (e?: React.MouseEvent) => void;
};

export function ThumbResultButtons({ onLayerReset, onTagSet, onPanelApply }: FirstProps) {
  const handlePanelApply = () => {
    onPanelApply();
  };

  return (
    <div className="thumb-func-buttons">
      <Button variant="secondary" onClick={onLayerReset}>레이어 초기화</Button>
      <Button variant="primary" onClick={handlePanelApply}>패널 적용</Button>
    </div>
  );
}

type SecondProps = {
  onPriceSet: () => void;
  onTagSet: () => void;
  onDelete: () => void;
};
export function ThumbEditorButtons({ onPriceSet, onTagSet, onDelete }: SecondProps) {
  return (
    <div className="thumb-func-buttons">
      <Button variant="eighth" onClick={onPriceSet}>이전번역 결과</Button>
      <Button variant="ninth" onClick={onTagSet}>올땀 스튜디오</Button>
      <Button variant="third-rate" onClick={onDelete}>에디터 +</Button>
    </div>
  );
}
