import React from "react";
import { ModalBase, ModalHeader, ModalBody, ModalFooter } from "@/components/common/Modal";
import ThumbnailPanel from "./parts/ThumbnailPanel";
import EditorMain from "./parts/EditorMain";
import ViewerPanel from "./parts/ViewerPanel";
import ThumbModalFooter from "./parts/ThumbnailModalFooter";
import { ThumbResultButtons, ThumbEditorButtons } from "./parts/ThumbnailFunctionButtons";
import SectionLabel from "./parts/SectionLabel";
import EditorControls from "./parts/EditorControls";
import "@/styles/productUpload/thumbnailModal.css";

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

export default function ThumbModal({
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
  return (
    <ModalBase isOpen={isOpen} onClose={onClose}>
      <ModalHeader title="썸네일" onClose={onClose} />
      <ModalBody>
        <div className="thumb-modal-container">
          <SectionLabel text="썸네일 패널" />
          <ThumbnailPanel
            thumbnails={thumbnails}
            currentIndex={currentIndex}
            onAdd={addImages}
            onRemove={removeImage}
            onSelect={setCurrentIndex}
          />

          <div className="thumb-main-wrapper">
            <div className="editor-wrapper">
              <SectionLabel text="올땀 에디터" />
              <EditorMain image={thumbnails[currentIndex] || ""} />
            </div>

            <div className="viewer-wrapper">
              <SectionLabel text="뷰어" />
              <div className="division-wrapper">
                <div className="viewer-main">
                  <ViewerPanel image={thumbnails[currentIndex] || ""} />
                </div>
                <div className="editor-func-buttons-wrapper">
                  <ThumbResultButtons
                    onPriceSet={() => console.log("모달 가격 설정")}
                    onTagSet={() => console.log("모달 태그 설정")}
                  />
                </div>
              </div>
              <div className="tolltip-place">
              </div>
              <div className="division-wrapper">
                {/* 모달 전용 기능 버튼 */}
                <EditorControls />
                <div className="division-line">
                </div>
                <div className="editor-func-buttons-wrapper">
                  <ThumbEditorButtons
                    onPriceSet={() => console.log("모달 가격 설정")}
                    onTagSet={() => console.log("모달 태그 설정")}
                    onDelete={() => removeImage(currentIndex)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <ThumbModalFooter onReset={resetImages} onSave={saveImages} />
      </ModalFooter>
    </ModalBase>
  );
}
