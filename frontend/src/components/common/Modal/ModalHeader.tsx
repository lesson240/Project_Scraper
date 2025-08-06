import React from "react";

type Props = {
  title?: string;
  onClose: () => void;
};

export default function ModalHeader({ title, onClose }: Props) {
  return (
    <div className="modal-header">
      {title && <h2>{title}</h2>}
      <button className="modal-close" onClick={onClose}>×</button>
    </div>
  );
}
