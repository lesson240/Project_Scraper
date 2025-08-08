import React from "react";
import EditorControls from "./EditorControls";

type Props = {
  image: string;
};

export default function ViewerPanel({ image }: Props) {
  return (
    <div className="viewer-panel">
      {image && <img src={image} alt="미리보기" />}
    </div>
  );
}
