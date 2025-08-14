import React from "react";

type Props = {
  src: string;
  isActive: boolean;
  onClick: () => void;
  onRemove: () => void;
};

export default function ThumbnailItem({ src, isActive, onClick, onRemove }: Props) {
  const handleClick = (e: React.MouseEvent) => {
    // 드래그 중이 아닐 때만 클릭 이벤트 처리
    if (e.detail > 0) {
      onClick();
    }
  };

  return (
    <div
      className={`thumbnail-item ${isActive ? "active" : ""}`}
      onClick={handleClick}
    >
      <img src={src} alt="thumbnail" />
      <button
        className="remove-btn"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        ×
      </button>
    </div>
  );
}
