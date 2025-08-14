import React, { useState, useRef } from "react";
import ThumbnailItem from "./ThumbnailItem";
import ThumbnailUploader from "./ThumbnailUploader";

type Props = {
  thumbnails: string[];
  currentIndex: number;
  onAdd: (newImages: string[]) => void;
  onRemove: (idx: number) => void;
  onSelect: (idx: number) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
};

export default function ThumbnailPanel({
  thumbnails,
  currentIndex,
  onAdd,
  onRemove,
  onSelect,
  onReorder,
}: Props) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onReorder(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="thumbnail-panel">
      <ThumbnailUploader onAdd={onAdd} />
      {thumbnails.map((src, idx) => (
        <div
          key={idx}
          ref={idx === draggedIndex ? dragRef : null}
          className={`thumbnail-drag-container ${idx === draggedIndex ? 'dragging' : ''
            } ${idx === dragOverIndex ? 'drag-over' : ''
            }`}
          draggable={true}
          onDragStart={(e) => handleDragStart(e, idx)}
          onDragOver={(e) => handleDragOver(e, idx)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, idx)}
          onDragEnd={handleDragEnd}
        >
          <ThumbnailItem
            src={src}
            isActive={idx === currentIndex}
            onClick={() => onSelect(idx)}
            onRemove={() => onRemove(idx)}
          />
        </div>
      ))}
    </div>
  );
}
