import React from "react";
import Button from "@/components/common/Button";
import "@/styles/productUpload/thumbnailModal.css";

type Props = {
  onPriceSet: () => void;
  onTagSet: () => void;
  onDelete: () => void;
};

export default function ThumbFunctionButtons({ onPriceSet, onTagSet, onDelete }: Props) {
  return (
    <div className="thumb-func-buttons">
      <Button variant="secondary" onClick={onPriceSet}>가격 설정</Button>
      <Button variant="secondary" onClick={onTagSet}>태그 설정</Button>
      <Button variant="sixth" onClick={onDelete}>이미지 삭제</Button>
    </div>
  );
}
