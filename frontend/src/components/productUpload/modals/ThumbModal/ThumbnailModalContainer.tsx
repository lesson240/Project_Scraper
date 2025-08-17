import React, { useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import ThumbModal from "./ThumbnailModal";
import { useThumbnailModal } from "@/hooks/useThumbnailModal";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  defaultImages: string[];
  onSave: (images: string[]) => void;
  origin_goods_code?: string;
};

export default function ThumbnailModalContainer({
  isOpen,
  onClose,
  defaultImages,
  onSave,
  origin_goods_code,
}: Props) {
  const {
    thumbnails,
    currentIndex,
    setCurrentIndex,
    addImages,
    removeImage,
    resetImages,
    saveImages,
    setThumbnails, // useThumbnailModal에서 setThumbnails 가져오기
  } = useThumbnailModal(defaultImages, onSave);

  // origin_goods_code 디버깅
  React.useEffect(() => {
    // 디버깅 로그 제거
  }, [origin_goods_code]);

  // ✅ updateThumbnail 함수 구현
  const updateThumbnail = useCallback((index: number, newImageUrl: string) => {
    setThumbnails(prev => {
      const newThumbnails = [...prev];
      newThumbnails[index] = newImageUrl;
      return newThumbnails;
    });
  }, [setThumbnails]);

  // ✅ updateThumbnails 함수 구현 (순서 변경용)
  const updateThumbnails = useCallback((newThumbnails: string[]) => {
    setThumbnails(newThumbnails);
  }, [setThumbnails]);

  // ✅ onSave 콜백을 useCallback으로 안정화
  const handleSave = useCallback(() => {
    onSave(thumbnails);
    onClose();
  }, [thumbnails, onSave, onClose]);

  // ✅ 모달 열릴 때 초기화 로직을 useCallback으로 안정화
  const initializeModal = useCallback(() => {
    resetImages();
    if (defaultImages?.length) {
      addImages(defaultImages);
    }
    setCurrentIndex(0);
  }, [defaultImages, resetImages, addImages, setCurrentIndex]);

  // ✅ 모달 열릴 때만 초기화 (의존성 최소화)
  useEffect(() => {
    if (isOpen) {
      initializeModal();
    }
  }, [isOpen, initializeModal]);

  if (!isOpen) return null;

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
      saveImages={handleSave}
      updateThumbnail={updateThumbnail}
      updateThumbnails={updateThumbnails}
      origin_goods_code={origin_goods_code}
    />
  );

  return ReactDOM.createPortal(modalJSX, document.body);
}