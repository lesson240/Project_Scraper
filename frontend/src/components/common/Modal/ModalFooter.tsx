import React from "react";
import "@/styles/common/modal.css";

export default function ModalFooter({ children }: { children: React.ReactNode }) {
  return <div className="modal-footer">{children}</div>;
}
