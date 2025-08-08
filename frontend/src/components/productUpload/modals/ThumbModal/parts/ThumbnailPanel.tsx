import React from "react";
import ThumbnailItem from "./ThumbnailItem";
import ThumbnailUploader from "./ThumbnailUploader";

type Props = {
  thumbnails: string[];
  currentIndex: number;
  onAdd: (newImages: string[]) => void;
  onRemove: (idx: number) => void;
  onSelect: (idx: number) => void;
};

export default function ThumbnailPanel({
  thumbnails,
  currentIndex,
  onAdd,
  onRemove,
  onSelect,
}: Props) {
  return (
    <div className="thumbnail-panel">
      <ThumbnailUploader onAdd={onAdd} />
      {thumbnails.map((src, idx) => (
        <ThumbnailItem
          key={idx}
          src={src}
          isActive={idx === currentIndex}
          onClick={() => onSelect(idx)}
          onRemove={() => onRemove(idx)}
        />
      ))}
    </div>
  );
}
