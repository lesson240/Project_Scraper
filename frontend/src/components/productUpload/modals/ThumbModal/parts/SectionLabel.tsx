import React from "react";
import "@/styles/productUpload/thumbnailModal.css";

type Props = {
  text: string;
};

export default function SectionLabel({ text }: Props) {
  return <div className="section-label">{text}</div>;
}
