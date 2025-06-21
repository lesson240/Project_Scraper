import { ModalBg } from "@/components/ModalLayout/ModalBg";
import { ModalBody } from "@/components/ModalLayout/ModalBody";
import { ModalHead } from "@/components/ModalLayout/ModalHead";
import { ModalInnerTop } from "@/components/ModalLayout/ModalInnerTop";
import { Spinner } from "@/components/Spinner/Spinner";
import { UploadSummary } from "@/interface/uploadinterface";
import axiosInstance from "@/utils/axiosInstance";
import { useState } from "react";

interface Props {
  selectedItem: UploadSummary[];
}

export const TranslateBulkButton = ({ selectedItem }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const clickTranslate = async () => {};
  return (
    <div>
      {/* <button
        onClick={clickTranslate}
        type="button"
        data-bs-toggle="modal"
        data-bs-target="#exampleModal1"
        className="cancel-btn save-btn reset-btn name-set-btn"
      >
        이미지 대량번역
      </button> */}
      {isLoading && (
        <ModalBg onClick={() => {}}>
          <ModalInnerTop>
            <ModalBody>
              <div className="pt-5 d-flex flex-col align-items-center gap-3">
                <Spinner />
                <p className="weight500">
                  이미지 번역중입니다. 잠시만 기다려주세요
                </p>
              </div>
            </ModalBody>
          </ModalInnerTop>
        </ModalBg>
      )}
    </div>
  );
};
