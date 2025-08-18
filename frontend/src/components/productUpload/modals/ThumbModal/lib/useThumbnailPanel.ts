import { useCallback } from 'react';
import ViewerCropHandler from '../parts/ViewerCropHandler';
import type { Orientation } from './thumbnail.types';
import type { Rect } from '@/hooks/useSelectionRect';

export const useThumbnailPanel = (
    isPanelApplyingRef: React.MutableRefObject<boolean>,
    currentIndex: number,
    crop: Rect | null,
    thumbnails: string[],
    updateThumbnail?: (index: number, newImageUrl: string) => void
) => {
    // 패널 적용: viewer의 현재 상태를 thumbnail-panel의 선택된 이미지에 적용
    const handlePanelApply = useCallback(async (
        e: React.MouseEvent | undefined,
        t: any,
        setOrientation: (orientation: Orientation) => void
    ) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        isPanelApplyingRef.current = true;

        const currentTransformState = {
            rotate: t.state.rotate,
            flipX: t.state.flipX,
            flipY: t.state.flipY,
            scale: t.state.scale,
            tx: t.state.tx,
            ty: t.state.ty
        };

        // Event queue clearing and forced synchronization
        await new Promise<void>((resolve) => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => resolve());
                    });
                });
            });
        });
        await new Promise<void>((resolve) => { setTimeout(resolve, 0); });

        try {
            const currentOrientation = {
                angle: currentTransformState.rotate,
                flipX: currentTransformState.flipX,
                flipY: currentTransformState.flipY
            };
            const currentCrop = crop;

            const currentImage = thumbnails[currentIndex];
            if (!currentImage) {
                console.error('현재 이미지가 없습니다.');
                isPanelApplyingRef.current = false;
                return;
            }

            const img = new Image();
            // 외부 호스팅 이미지의 캔버스 오염을 방지하기 위해 fetch→blob→objectURL 경로 사용
            // 우선 onload 핸들러 준비
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    isPanelApplyingRef.current = false;
                    return;
                }

                const { sx, sy, sw, sh } = ViewerCropHandler.calculateCrop(img, currentCrop, currentOrientation);

                canvas.width = sw;
                canvas.height = sh;
                ctx.save();

                // 흰색 배경을 먼저 그리기
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, sw, sh);

                // 회전/반전 적용
                if (currentOrientation.angle !== 0) {
                    const centerX = sw / 2;
                    const centerY = sh / 2;
                    ctx.translate(centerX, centerY);
                    ctx.rotate((currentOrientation.angle * Math.PI) / 180);
                    ctx.translate(-centerX, -centerY);
                }

                if (currentOrientation.flipX || currentOrientation.flipY) {
                    ctx.scale(
                        currentOrientation.flipX ? -1 : 1,
                        currentOrientation.flipY ? -1 : 1
                    );
                    if (currentOrientation.flipX) ctx.translate(-sw, 0);
                    if (currentOrientation.flipY) ctx.translate(0, -sh);
                }

                // 실제 이미지 영역만 그리기 (이미지 경계를 벗어나는 부분은 흰색 배경 유지)
                const actualSx = Math.max(0, sx);
                const actualSy = Math.max(0, sy);
                const actualSw = Math.min(sw, img.naturalWidth - actualSx);
                const actualSh = Math.min(sh, img.naturalHeight - actualSy);

                if (actualSw > 0 && actualSh > 0) {
                    ctx.drawImage(img, actualSx, actualSy, actualSw, actualSh,
                        Math.max(0, -sx), Math.max(0, -sy), actualSw, actualSh);
                }

                ctx.restore();

                canvas.toBlob((blob) => {
                    if (blob) {
                        const newImageUrl = URL.createObjectURL(blob);
                        if (updateThumbnail) {
                            updateThumbnail(currentIndex, newImageUrl);
                        }
                    } else {
                        console.error('Blob 생성 실패');
                    }

                    // Transform State 초기화
                    t.fit();
                    setOrientation({ angle: 0, flipX: false, flipY: false });

                    // Release flag with delay
                    setTimeout(() => {
                        isPanelApplyingRef.current = false;
                    }, 500);
                }, 'image/jpeg', 0.9);
            };
            img.onerror = (error) => {
                console.error('이미지 로드 실패:', error);
                setTimeout(() => { isPanelApplyingRef.current = false; }, 500);
            };

            // 안전 로드: same-origin이 아니면 fetch로 blob 후 objectURL 로드
            try {
                const isCross = /^https?:\/\//.test(currentImage) && !currentImage.includes('localhost:');
                if (isCross) {
                    fetch(currentImage, { mode: 'cors' })
                        .then(res => res.blob())
                        .then(blob => {
                            const url = URL.createObjectURL(blob);
                            img.src = url;
                        })
                        .catch(err => {
                            console.error('이미지 fetch 실패:', err);
                            setTimeout(() => { isPanelApplyingRef.current = false; }, 500);
                        });
                } else {
                    img.crossOrigin = 'anonymous';
                    img.src = currentImage;
                }
            } catch (e) {
                console.error('이미지 안전 로드 실패:', e);
                setTimeout(() => { isPanelApplyingRef.current = false; }, 500);
            }
        } catch (error) {
            console.error('패널 적용 중 오류 발생:', error);
            setTimeout(() => { isPanelApplyingRef.current = false; }, 500);
        }
    }, [isPanelApplyingRef, currentIndex, crop, thumbnails, updateThumbnail]);

    return {
        handlePanelApply
    };
};
