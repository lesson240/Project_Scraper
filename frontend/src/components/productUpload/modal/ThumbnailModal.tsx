import React from "react";
import ModalContent from "@/components/shared/modal/ModalContent";
import ThumbnailPanel from "@/components/productUpload/modal/parts/ThumbnailPanel";
import ThumbnailUploader from "@/components/productUpload/modal/parts/ThumbnailUploader";
import ThumbnailViewer from "@/components/productUpload/modal/parts/ThumbnailViewer";
import EditorControls from "@/components/productUpload/modal/parts/EditorControls";
import ThumbnailModalFooter from "@/components/productUpload/modal/parts/ThumbnailModalFooter";
import "@/styles/modal/thumbnailModal.css";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  thumbnails: string[];
  currentIndex: number;
  setCurrentIndex: (idx: number) => void;
  addImages: (newImages: string[]) => void;
  removeImage: (idx: number) => void;
  resetImages: () => void;
  saveImages: () => void;
};

export default function ThumbnailModal({
  isOpen,
  onClose,
  thumbnails,
  currentIndex,
  setCurrentIndex,
  addImages,
  removeImage,
  resetImages,
  saveImages,
}: Props) {
  if (!isOpen) return null;

  return (
    <ModalContent onClose={onClose}>
      <ModalContent.ModalHead>썸네일</ModalContent.ModalHead>
      <ModalContent.ModalBody>
        <div className="thumbnail-modal-container">
          <div className="thumbnail-panel-wrapper">
            <ThumbnailUploader
              onAdd={(files) => {
                if (!files) return;
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
            <ThumbnailViewer imageUrl={thumbnails[currentIndex] || thumbnails[0] || ""} />
            <EditorControls />
          </div>
        </div>
      </ModalContent.ModalBody>
      <ThumbnailModalFooter
        onReset={resetImages}
        onSave={saveImages}
      />
    </ModalContent>
  );
}
