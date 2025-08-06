import React from "react";

type Props = {
  src: string;
  isActive: boolean;
  onClick: () => void;
  onRemove: () => void;
};

export default function ThumbnailItem({ src, isActive, onClick, onRemove }: Props) {
  return (
    <div className={`thumbnail-item ${isActive ? "active" : ""}`} onClick={onClick}>
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
