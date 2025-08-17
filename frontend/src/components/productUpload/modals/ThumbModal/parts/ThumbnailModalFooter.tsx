import React from "react";

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
    <div className="thumbnail-modal-footer">
      <button className="btn-reset" onClick={onReset}>초기화</button>
      <button className="btn-save" onClick={handleSave}>저장</button>
    </div>
  );
}
