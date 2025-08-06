// import { useState, useEffect } from "react";

// /**
//  * useThumbnailModal
//  * - 썸네일 모달 상태 및 이미지 배열 관리
//  * - initialImages 변경 시 thumbnails와 currentIndex를 초기화
//  */
// export function useThumbnailModal(
//   initialImages: string[],
//   onSave: (images: string[]) => void
// ) {
//   const [thumbnails, setThumbnails] = useState<string[]>(initialImages || []);
//   const [currentIndex, setCurrentIndex] = useState(0);

//   /** ✅ initialImages 변경 시 thumbnails와 currentIndex 초기화 */
//   useEffect(() => {
//     setThumbnails(initialImages && initialImages.length > 0 ? [...initialImages] : []);
//     setCurrentIndex(0);
//   }, [initialImages]);

//   /** 새 이미지 추가 */
//   const addImages = (newImages: string[]) => {
//     setThumbnails((prev) => [...prev, ...newImages]);
//     if (thumbnails.length === 0 && newImages.length > 0) {
//       setCurrentIndex(0); // 첫 이미지부터 표시
//     }
//   };

//   /** 이미지 삭제 */
//   const removeImage = (index: number) => {
//     setThumbnails((prev) => {
//       const updated = prev.filter((_, i) => i !== index);
//       // index 범위 보정
//       setCurrentIndex((prevIndex) => Math.min(updated.length - 1, prevIndex));
//       return updated;
//     });
//   };

//   /** 이미지 초기화 */
//   const resetImages = () => {
//     const resetArray = initialImages && initialImages.length > 0 ? [...initialImages] : [];
//     setThumbnails(resetArray);
//     setCurrentIndex(0);
//   };

//   /** 이미지 저장 */
//   const saveImages = (newImages?: string[]) => {
//     const finalImages = newImages ?? thumbnails;
//     setThumbnails(finalImages);
//     onSave(finalImages);
//     setCurrentIndex(0); // 저장 후에도 첫 이미지로 초기화
//   };

//   return {
//     thumbnails,
//     currentIndex,
//     setCurrentIndex,
//     addImages,
//     removeImage,
//     resetImages,
//     saveImages,
//   };
// }

// export default useThumbnailModal;


import { useState } from "react";

/**
 * 썸네일 모달 상태 관리 훅
 * @param initialImages 초기 이미지 배열
 * @param onSave 저장 시 실행되는 콜백
 */
export function useThumbnailModal(
  initialImages: string[] = [],
  onSave?: (images: string[]) => void
) {
  const [thumbnails, setThumbnails] = useState<string[]>(initialImages);
  const [currentIndex, setCurrentIndex] = useState(0);

  const addImages = (newImages: string[]) => {
    setThumbnails((prev) => [...prev, ...newImages]);
    setCurrentIndex((prev) => (prev === 0 && prev === thumbnails.length ? 0 : prev));
  };

  const removeImage = (idx: number) => {
    setThumbnails((prev) => prev.filter((_, i) => i !== idx));
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const resetImages = () => {
    setThumbnails([]);
    setCurrentIndex(0);
  };

  const saveImages = () => {
    if (onSave) onSave(thumbnails);
  };

  return {
    thumbnails,
    currentIndex,
    setCurrentIndex,
    addImages,
    removeImage,
    resetImages,
    saveImages,
  };
}
