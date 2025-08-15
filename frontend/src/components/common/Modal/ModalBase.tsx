import React from "react";
import "@/styles/common/modal.css";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  disableOutsideClick?: boolean; // 외부 클릭 시 close 방지 옵션 추가
};

export default function ModalBase({ isOpen, onClose, children, disableOutsideClick = false }: Props) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (!disableOutsideClick) {
      onClose();
    }
  };

  // 모달 내부 이벤트 전파 차단
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // 모달 내부 휠 이벤트 전파 차단
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };

  // 모달 내부 키보드 이벤트 전파 차단
  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div
        className="modal-container"
        onClick={handleModalClick}
        onWheel={handleWheel}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </div>
  );
}
