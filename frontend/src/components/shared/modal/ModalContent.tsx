import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import "@/styles/modal/modalContent.css";

type ModalContentProps = {
  children: React.ReactNode;
  onClose?: () => void; // ✅ 외부 클릭 또는 ESC 닫기용
};

function ModalOverlay({ children, onClose }: ModalContentProps) {
  // ✅ 모달 열릴 때 body 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = "hidden";

    // ✅ ESC 키 닫기
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // ✅ 배경 클릭 시 닫기
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">{children}</div>
    </div>
  );
}

/**
 * ModalContent 컴포넌트
 * - React 19 / Recoil 환경에서도 안전하게 동작
 * - Portal을 root 내부에 렌더링
 * - ESC 키와 배경 클릭으로 닫기 지원
 */
export default function ModalContent({ children, onClose }: ModalContentProps) {
  const rootElement = document.getElementById("root");
  if (!rootElement) return null;

  return ReactDOM.createPortal(
    <ModalOverlay onClose={onClose}>{children}</ModalOverlay>,
    rootElement
  );
}

/** 모달 헤더 */
ModalContent.ModalHead = function ModalHead({ children }: ModalContentProps) {
  return <div className="modal-head">{children}</div>;
};

/** 모달 바디 */
ModalContent.ModalBody = function ModalBody({ children }: ModalContentProps) {
  return <div className="modal-body">{children}</div>;
};
