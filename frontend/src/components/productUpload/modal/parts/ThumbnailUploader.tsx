import React, { useRef } from "react";
import "@/styles/modal/thumbnailModal.css";

type Props = {
  onAdd: (files: FileList | null) => void;
};

export default function ThumbnailUploader({ onAdd }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => fileInputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAdd(e.target.files);
    e.target.value = ""; // 같은 파일 재업로드 가능하도록 초기화
  };

  return (
    <div className="thumbnail-uploader" onClick={handleClick}>
      <span className="plus-icon">+</span>
      <input
        type="file"
        accept="image/*"
        multiple
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleChange}
      />
    </div>
  );
}
