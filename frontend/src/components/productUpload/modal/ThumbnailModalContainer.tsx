import React from "react";
import ThumbnailModal from "./ThumbnailModal";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  defaultImages: string[];
  onSave: (images: string[]) => void;
};

/**
 * ThumbnailModalContainer
 * - 외부에서 상태 제어
 * - 모달만 렌더링
 */
export default function ThumbnailModalContainer({
  isOpen,
  onClose,
  defaultImages,
  onSave,
}: Props) {
  if (!isOpen) return null;

  return (
    <ThumbnailModal
      isOpen={isOpen}
      onClose={onClose}
      defaultImages={defaultImages}
      onSave={onSave}
    />
  );
}
