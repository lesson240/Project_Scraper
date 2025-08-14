// 썸네일 관련 타입 정의
export type Orientation = {
    angle: number;
    flipX: boolean;
    flipY: boolean;
};

export type TransformState = {
    rotate: number;
    flipX: boolean;
    flipY: boolean;
    scale: number;
    tx: number;
    ty: number;
};

export type ThumbnailModalProps = {
    isOpen: boolean;
    onClose: () => void;
    thumbnails: string[];
    currentIndex: number;
    setCurrentIndex: (idx: number) => void;
    addImages: (newImages: string[]) => void;
    removeImage: (idx: number) => void;
    resetImages: () => void;
    saveImages: () => void;
    updateThumbnail?: (index: number, newImageUrl: string) => void;
    updateThumbnails?: (newThumbnails: string[]) => void;
};
