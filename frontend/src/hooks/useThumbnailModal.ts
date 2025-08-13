import { useState, useCallback, useRef, useEffect } from "react";

export function useThumbnailModal(
  defaultImages: string[],
  onSave: (images: string[]) => void
) {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ✅ onSave를 ref로 저장하여 의존성 문제 해결
  const onSaveRef = useRef(onSave);
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  // ✅ resetImages 함수를 useCallback으로 안정화
  const resetImages = useCallback(() => {
    setThumbnails([]);
    setCurrentIndex(0);
  }, []);

  // ✅ addImages 함수를 useCallback으로 안정화
  const addImages = useCallback((newImages: string[]) => {
    setThumbnails(prev => [...prev, ...newImages]);
  }, []);

  // ✅ removeImage 함수를 useCallback으로 안정화
  const removeImage = useCallback((idx: number) => {
    setThumbnails(prev => {
      const newThumbnails = prev.filter((_, i) => i !== idx);
      // 현재 인덱스 조정
      if (newThumbnails.length === 0) {
        setCurrentIndex(0);
      } else if (idx <= currentIndex && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
      return newThumbnails;
    });
  }, [currentIndex]);

  // ✅ saveImages 함수를 useCallback으로 안정화
  const saveImages = useCallback(() => {
    onSaveRef.current(thumbnails);
  }, [thumbnails]);

  // ✅ setCurrentIndex를 useCallback으로 안정화
  const handleSetCurrentIndex = useCallback((idx: number) => {
    setCurrentIndex(Math.max(0, Math.min(idx, thumbnails.length - 1)));
  }, [thumbnails.length]);

  return {
    thumbnails,
    currentIndex,
    setCurrentIndex: handleSetCurrentIndex,
    addImages,
    removeImage,
    resetImages,
    saveImages,
  };
}