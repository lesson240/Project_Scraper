import React from "react";

type Props = {
  onReset: () => void;
  onSave: () => void;
};

export default function ThumbModalFooter({ onReset, onSave }: Props) {
  return (
    <div className="thumbnail-modal-footer">
      <button className="btn-reset" onClick={onReset}>초기화</button>
      <button className="btn-save" onClick={onSave}>저장</button>
    </div>
  );
}
