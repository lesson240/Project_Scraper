// src/hooks/useThumbnailManager.ts
import { useState } from "react";

/**
 * 썸네일 이미지 관리 훅
 * - 이미지 배열, 현재 선택 인덱스
 * - 추가/삭제/리셋/저장 기능 제공
 */
export function useThumbnailManager(
  initialImages: string[],
  onSave: (images: string[]) => void
) {
  const [thumbnails, setThumbnails] = useState<string[]>(initialImages);
  const [currentIndex, setCurrentIndex] = useState(0);

  /** 이미지 추가 */
  const addImages = (newImages: string[]) => {
    setThumbnails((prev) => [...prev, ...newImages]);
  };

  /** 특정 인덱스 이미지 삭제 */
  const removeImage = (index: number) => {
    setThumbnails((prev) => prev.filter((_, i) => i !== index));
    // 삭제 후 인덱스 조정
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  /** 초기 상태로 복원 */
  const resetImages = () => {
    setThumbnails(initialImages);
    setCurrentIndex(0);
  };

  /** 저장 (onSave 콜백 실행) */
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

export default useThumbnailManager;
