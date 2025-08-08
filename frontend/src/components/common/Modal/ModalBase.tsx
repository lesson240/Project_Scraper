import React from "react";
import "@/styles/common/modal.css";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function ModalBase({ isOpen, onClose, children }: Props) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()} // 내부 클릭 시 닫힘 방지
      >
        {children}
      </div>
    </div>
  );
}
