import React from "react";
import ModalContent from "@/components/shared/modal/ModalContent";
import { useThumbnailModal } from "@/hooks/useThumbnailModal";
import ThumbnailPanel from "@/components/productUpload/modal/parts/ThumbnailPanel";
import ThumbnailUploader from "@/components/productUpload/modal/parts/ThumbnailUploader";
import ThumbnailViewer from "@/components/productUpload/modal/parts/ThumbnailViewer";
import EditorControls from "@/components/productUpload/modal/parts/EditorControls";
import ThumbnailModalFooter from "@/components/productUpload/modal/parts/ThumbnailModalFooter";
import "@/styles/modal/thumbnailModal.css";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  defaultImages: string[];
  onSave: (images: string[]) => void;
};

export default function ThumbnailModal({ isOpen, onClose, defaultImages, onSave }: Props) {
  const {
    thumbnails,
    currentIndex,
    setCurrentIndex,
    addImages,
    removeImage,
    resetImages,
    saveImages,
  } = useThumbnailModal(defaultImages, onSave);

  if (!isOpen) return null;

  return (
    <ModalContent>
      <ModalContent.ModalHead>썸네일</ModalContent.ModalHead>
      <ModalContent.ModalBody>
        <div className="thumbnail-modal-container">
          <div className="thumbnail-panel-wrapper">
            <ThumbnailUploader
              onAdd={(files) => {
                const fileArray = Array.from(files).map((file) =>
                  URL.createObjectURL(file)
                );
                addImages(fileArray);
              }}
            />
            <ThumbnailPanel
              imgList={thumbnails}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
              onRemove={removeImage}
            />
          </div>

          <div className="thumbnail-viewer-wrapper">
            <ThumbnailViewer imageUrl={thumbnails[currentIndex]} />
            <EditorControls />
          </div>
        </div>
      </ModalContent.ModalBody>
      <ThumbnailModalFooter
        onReset={resetImages}
        onSave={() => saveImages()}
      />
    </ModalContent>
  );
}
