import React from "react";
import ModalHeader from "./ModalHeader";
import ModalBody from "./ModalBody";
import ModalFooter from "./ModalFooter";
import ModalBase from "./ModalBase";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

export default function ModalContent({ isOpen, onClose, title, footer, children }: Props) {
  return (
    <ModalBase isOpen={isOpen} onClose={onClose}>
      <ModalHeader title={title} onClose={onClose} />
      <ModalBody>{children}</ModalBody>
      {footer && <ModalFooter>{footer}</ModalFooter>}
    </ModalBase>
  );
}
