import React from "react";
import "@/styles/productUpload/thumbnailModal.css";

type Props = {
  imageUrl?: string;
};

export default function ThumbnailViewer({ imageUrl }: Props) {
  return (
    <div className="thumbnail-viewer">
      {imageUrl ? (
        <img src={imageUrl} alt="대표 썸네일" />
      ) : (
        <div className="empty-viewer">이미지를 선택하세요</div>
      )}
    </div>
  );
}
