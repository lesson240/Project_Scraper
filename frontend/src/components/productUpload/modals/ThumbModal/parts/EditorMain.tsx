import React from "react";

type Props = {
  image: string;
};

export default function EditorMain({ image }: Props) {
  return (
    <div className="editor-main">
      {image ? <img src={image} alt="편집 이미지" /> : <div>이미지를 선택하세요</div>}
    </div>
  );
}
