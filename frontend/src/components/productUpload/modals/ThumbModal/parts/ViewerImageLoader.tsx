// src/components/productUpload/modals/ThumbModal/parts/ViewerImageLoader.tsx
// ✅ 이미지 로딩 전용 컴포넌트
// ✅ 로딩 상태 관리 및 에러 처리

import React, { useEffect, useRef, useState } from "react";

type Props = {
    image: string;
    children: (imgRef: React.RefObject<HTMLImageElement>, ready: boolean) => React.ReactNode;
};

export default function ViewerImageLoader({ image, children }: Props) {
    const imgRef = useRef<HTMLImageElement | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!image) {
            imgRef.current = null;
            setReady(false);
            return;
        }

        const im = new Image();
        im.crossOrigin = "anonymous";
        setReady(false);

        im.onload = () => {
            imgRef.current = im;
            setReady(true);
            // console.log('ViewerImageLoader: Image loaded successfully');
        };

        im.onerror = () => {
            // console.error('ViewerImageLoader: Failed to load image:', image);
            setReady(false);
        };

        im.src = image;

        return () => {
            imgRef.current = null;
            setReady(false);
        };
    }, [image]);

    return <>{children(imgRef, ready)}</>;
}