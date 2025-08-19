// src/components/productUpload/modals/ThumbModal/parts/ViewerImageLoader.tsx
// ✅ 이미지 로딩 전용 컴포넌트
// ✅ 로딩 상태 관리 및 에러 처리

import React, { useEffect, useRef, useState } from "react";
import apiConfig from "@/config/api";

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
        // 교차 출처일 때만 CORS 요청. 동일 출처/blob/data는 설정하지 않음
        const isBlobOrData = image.startsWith('blob:') || image.startsWith('data:');
        const isAbsolute = /^https?:\/\//i.test(image);
        const isSameOrigin = !isAbsolute || image.startsWith(window.location.origin);
        if (!isBlobOrData && !isSameOrigin) {
            im.crossOrigin = "anonymous";
        }
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

        // 교차 출처인 공개 URL은 백엔드 프록시를 통해 불러와 캔버스 오염을 방지
        if (!isBlobOrData && !isSameOrigin) {
            const proxied = `${apiConfig.baseUrl}/v1/imagehost/delivery/proxy?url=${encodeURIComponent(image)}`;
            im.src = proxied;
        } else {
            im.src = image;
        }

        return () => {
            imgRef.current = null;
            setReady(false);
        };
    }, [image]);

    return <>{children(imgRef, ready)}</>;
}