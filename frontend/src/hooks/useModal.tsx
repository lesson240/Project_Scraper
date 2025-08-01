// src/hooks/useModal.ts
import { useState } from "react";

/**
 * 모달 열림/닫힘 상태를 관리하는 재사용 훅
 */
export function useModal() {
  const [isOpen, setIsOpen] = useState(false);

  /** 모달 열기 */
  const open = () => setIsOpen(true);

  /** 모달 닫기 */
  const close = () => setIsOpen(false);

  return { isOpen, open, close };
}

export default useModal;
