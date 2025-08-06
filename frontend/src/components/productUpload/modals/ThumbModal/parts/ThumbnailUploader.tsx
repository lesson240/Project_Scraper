import React, { useRef } from "react";

type Props = {
  onAdd: (newImages: string[]) => void;
};

export default function ThumbnailUploader({ onAdd }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const fileArray = Array.from(files).map((file) => URL.createObjectURL(file));
    onAdd(fileArray);
    e.target.value = "";
  };

  return (
    <div className="thumbnail-uploader" onClick={() => fileRef.current?.click()}>
      <span>+</span>
      <input
        type="file"
        multiple
        accept="image/*"
        ref={fileRef}
        style={{ display: "none" }}
        onChange={handleChange}
      />
    </div>
  );
}
