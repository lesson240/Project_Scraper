import { useCallback } from 'react';

export const useThumbnailReorder = (
    thumbnails: string[],
    currentIndex: number,
    updateThumbnails?: (newThumbnails: string[]) => void,
    setCurrentIndex?: (idx: number) => void
) => {
    // 썸네일 순서 변경 함수 - 교환 방식으로 변경
    const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
        if (fromIndex === toIndex) return;

        const newThumbnails = [...thumbnails];

        // 교환 방식: 두 이미지의 위치를 서로 바꿈
        const temp = newThumbnails[fromIndex];
        newThumbnails[fromIndex] = newThumbnails[toIndex];
        newThumbnails[toIndex] = temp;

        // thumbnails 상태 업데이트
        if (updateThumbnails) {
            updateThumbnails(newThumbnails);
        }

        // 현재 선택된 인덱스 조정
        if (setCurrentIndex) {
            let newCurrentIndex = currentIndex;

            // 현재 선택된 이미지가 이동된 경우
            if (currentIndex === fromIndex) {
                newCurrentIndex = toIndex;
            } else if (currentIndex === toIndex) {
                newCurrentIndex = fromIndex;
            }
            // 그 외의 경우는 인덱스 변경 없음

            if (newCurrentIndex !== currentIndex) {
                setCurrentIndex(newCurrentIndex);
            }
        }
    }, [thumbnails, currentIndex, updateThumbnails, setCurrentIndex]);

    return {
        handleReorder
    };
};
