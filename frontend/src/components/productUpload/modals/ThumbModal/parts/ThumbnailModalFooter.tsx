import React from "react";
import Button from "@/components/common/Button";
import "@/styles/collect/filterButtons.css";

type Props = {
  onReset: () => void;
  onSave: (originGoodsCode: string) => void;
  originGoodsCode: string;
};

export default function ThumbModalFooter({ onSave, onReset, originGoodsCode }: Props) {
  const handleSave = () => {
    onSave(originGoodsCode);
  };

  return (
    <div className="button-box">
      <Button variant="fourth" onClick={onReset}>초기화</Button>
      <Button variant="primary" onClick={handleSave}>저장</Button>
    </div>
  );
}
