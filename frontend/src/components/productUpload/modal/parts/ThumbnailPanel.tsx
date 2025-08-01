import React from "react";
import "@/styles/modal/thumbnailModal.css";

type Props = {
  imgList: string[];
  currentIndex: number;
  setCurrentIndex: (idx: number) => void;
  onRemove: (idx: number) => void;
};

export default function ThumbnailPanel({
  imgList,
  currentIndex,
  setCurrentIndex,
  onRemove,
}: Props) {
  return (
    <div className="thumbnail-panel">
      {imgList.map((src, idx) => (
        <div
          key={idx}
          className={`thumbnail-item ${idx === currentIndex ? "active" : ""}`}
          onClick={() => setCurrentIndex(idx)}
        >
          <img src={src} alt={`thumb-${idx}`} />
          <button className="remove-btn" onClick={(e) => {
            e.stopPropagation();
            onRemove(idx);
          }}>×</button>
        </div>
      ))}
    </div>
  );
}
