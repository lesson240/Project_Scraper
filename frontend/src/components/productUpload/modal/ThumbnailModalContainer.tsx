import React from "react";
import ReactDOM from "react-dom";
import ThumbnailModal from "./ThumbnailModal";
import { useThumbnailModal } from "@/hooks/useThumbnailModal";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  defaultImages: string[];
  onSave: (images: string[]) => void;
};

export default function ThumbnailModalContainer({
  isOpen,
  onClose,
  defaultImages,
  onSave,
}: Props) {
  const {
    thumbnails,
    currentIndex,
    setCurrentIndex,
    addImages,
    removeImage,
    resetImages,
    saveImages,
  } = useThumbnailModal(defaultImages, (imgs) => {
    onSave(imgs);
    onClose();
  });

  if (!isOpen) return null;

  const rootElement = document.getElementById("root");
  const modalJSX = (
    <ThumbnailModal
      isOpen={isOpen}
      onClose={onClose}
      thumbnails={thumbnails}
      currentIndex={currentIndex}
      setCurrentIndex={setCurrentIndex}
      addImages={addImages}
      removeImage={removeImage}
      resetImages={resetImages}
      saveImages={saveImages}
    />
  );

  return rootElement ? ReactDOM.createPortal(modalJSX, rootElement) : modalJSX;
}
