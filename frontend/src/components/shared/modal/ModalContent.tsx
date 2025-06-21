import { isDeskTop } from "@/atom/atom";
import useModal from "@/hooks/useModal";
import { useRecoilValue } from "recoil";

interface Props {
  children: React.ReactNode;
  width?: number;
  unset?: boolean;
  fixHeight?: number;
}

const ModalContent = ({ children, width, unset = false, fixHeight }: Props) => {
  const isDesktop = useRecoilValue(isDeskTop);

  const widthStyle = {
    width: `${isDesktop ? (width ? width : "800") : "360"}px`,
    maxWidth: `${isDesktop ? (width ? width : "800") : "360"}px`,
  };

  const unsetStyle = {
    overflow: unset ? "unset" : "",
    height: `${fixHeight ? `${fixHeight}px` : "none"}`,
  };

  return (
    <div
      style={widthStyle}
      className={`modal-dialog1 d-flex align-items-center justify-content-center`}
    >
      <div
        style={unsetStyle}
        className="modal-content modalInner"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {children}
      </div>
    </div>
  );
};

const ModalBody = ({ children }: { children: React.ReactNode }) => {
  return <div className="modal-body">{children}</div>;
};

const ModalHead = ({ children }: { children: React.ReactNode }) => {
  const { closeModal } = useModal();
  return (
    <div className="modal-header modal-sticky">
      <h5 className="d-flex align-items-center h1">{children}</h5>
      <button type="button" className="btn-close" onClick={closeModal}></button>
    </div>
  );
};

ModalContent.ModalHead = ModalHead;
ModalContent.ModalBody = ModalBody;

export default ModalContent;
