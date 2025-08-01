import { useState } from "react";

/** 모달 열림/닫힘 관리 훅 */
function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return { isOpen, open, close };
}

/** 썸네일 이미지 관리 훅 */
function useThumbnailManager(initialImages: string[], onSave: (images: string[]) => void) {
  const [thumbnails, setThumbnails] = useState<string[]>(initialImages);
  const [currentIndex, setCurrentIndex] = useState(0);

  const addImages = (newImages: string[]) => {
    setThumbnails((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setThumbnails((prev) => prev.filter((_, i) => i !== index));
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const resetImages = () => {
    setThumbnails(initialImages);
    setCurrentIndex(0);
  };

  const saveImages = (newImages?: string[]) => {
    const finalImages = newImages ?? thumbnails;
    setThumbnails(finalImages);
    onSave(finalImages);
  };

  return {
    thumbnails,
    currentIndex,
    setCurrentIndex,
    addImages,
    removeImage,
    resetImages,
    saveImages,
    setThumbnails,
  };
}

/** 통합 훅 (Container/Modal 공용) */
export function useThumbnailModal(initialImages: string[], onSave: (images: string[]) => void) {
  const modal = useModal();
  const manager = useThumbnailManager(initialImages, onSave);

  return { ...modal, ...manager };
}

export default useThumbnailModal;
