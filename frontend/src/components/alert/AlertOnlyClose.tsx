import { useEffect } from "react";
import { ModalBg } from "../ModalLayout/ModalBg";
import { ModalInnerCenter } from "../ModalLayout/ModalInnerCenter";

interface Props {
  message: string;
  closeAlert: () => void;
  additionalClose?: () => void;
  additionalCleanup?: any;
}

export const AlertOnlyClose = ({
  message,
  closeAlert,
  additionalClose,
  additionalCleanup,
}: Props) => {
  useEffect(() => {
    return () => {
      if (additionalCleanup) {
        additionalCleanup();
      }
    };
  }, []);
  return (
    <ModalBg onClick={closeAlert}>
      <ModalInnerCenter>
        <>
          <div className="modal-header">
            <h5
              className="modal-title d-flex align-items-center"
              id="exampleModalLabel"
            >
              알림
            </h5>
          </div>
          <hr className="mt-0 mb-4" />
          <div className="modal-body">
            <h4 className="weight500">{message}</h4>
            <div className="row mt-4">
              <div className="col-12">
                <div className="d-flex align-items-center justify-content-center gap-3 mt-4">
                  <button
                    className="cancel-btn save-btn"
                    onClick={() => {
                      if (additionalClose) {
                        closeAlert();
                        additionalClose!();
                      } else {
                        closeAlert();
                      }
                    }}
                  >
                    확인
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      </ModalInnerCenter>
    </ModalBg>
  );
};
