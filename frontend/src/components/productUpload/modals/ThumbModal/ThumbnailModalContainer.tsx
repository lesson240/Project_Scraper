import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import ThumbModal from "./ThumbnailModal";
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

  /** ✅ 모달 열릴 때 defaultImages로 초기화 */
  useEffect(() => {
    if (isOpen) {
      resetImages();
      if (defaultImages?.length) {
        addImages(defaultImages);
      }
      setCurrentIndex(0);
    }
  }, [isOpen, defaultImages]);

  if (!isOpen) return null;

  const rootElement = document.getElementById("root");
  const modalJSX = (
    <ThumbModal
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
