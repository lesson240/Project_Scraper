import React from "react";

type Props = {
  title?: string;
  onClose?: () => void;
  children?: React.ReactNode;
};

export default function ModalHeader({ title, onClose, children }: Props) {
  return (
    <div className="modal-header">
      {children ? children : (title && <h2>{title}</h2>)}
      {onClose && (
        <button className="modal-close" onClick={onClose}>×</button>
      )}
    </div>
  );
}
