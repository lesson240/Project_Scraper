import React from "react";
import Button from "@/components/common/Button";
import "@/styles/productUpload/thumbnailModal.css";


type FirstProps = {
  onPriceSet: () => void;
  onTagSet: () => void;
};
export function ThumbResultButtons({ onPriceSet, onTagSet }: FirstProps) {
  return (
    <div className="thumb-func-buttons">
      <Button variant="eighth" onClick={onPriceSet}>이전번역 결과</Button>
      <Button variant="ninth" onClick={onTagSet}>올땀 스튜디오</Button>
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
