import { upload } from "../../../../../utils/functions/postApi";
import { useAlert } from "../../../../../hooks/useAlert";
import {
  ApplyCategory,
  CategorySearchKeyword,
  UploadSummary,
} from "@/interface/uploadinterface";
import { AlertOnlyClose } from "@/components/Alert/AlertOnlyClose";
import { Alert } from "react-bootstrap";
import useModal from "@/hooks/useModal";
import { regex } from "@/utils/regex";
import { useRecoilState } from "recoil";
import { refetchIntervalLoading } from "@/atom/atom";

interface Props {
  selectedItem: UploadSummary[];
  applyCategory: ApplyCategory;
  storeName: CategorySearchKeyword;
  isAutoMapping: boolean;
}

export const UploadButtonBox = ({
  isAutoMapping,
  storeName,
  selectedItem,
  applyCategory,
}: Props) => {
  const { closeModal } = useModal();
  const {
    isAlert: successAlert,
    handleAlert: handleSuccess,
    alertMessage: successMessage,
  } = useAlert();
  const { isAlert, handleAlert, alertMessage } = useAlert();
  const [refetchInterval, setRefetchInterval] = useRecoilState(
    refetchIntervalLoading
  );
  const confirmUpload = async () => {
    try {
      const uploadRes = await upload.uploadProduct({
        storeName: {
          smartStore: storeName.SmartStore,
          elevenst: storeName.Elevenst,
          auction: storeName.Auction,
          coupang: storeName.Coupang,
          gmarket: storeName.Gmarket,
        },
        objectIds: selectedItem.map((item) => item.id),
        category: {
          customCategoryIdx: 0,
          idx: {
            coupang: applyCategory.coupang
              ? parseInt((applyCategory.coupang as any).coupang)
              : 0,
            smartStore: applyCategory.smartstore
              ? parseInt((applyCategory.smartstore as any).id)
              : applyCategory.coupang
              ? parseInt((applyCategory.coupang as any).smartstore)
              : 0,
            elevenst: applyCategory.elevenst
              ? parseInt((applyCategory.elevenst as any).id)
              : applyCategory.coupang
              ? parseInt((applyCategory.coupang as any).elevenst)
              : 0,
            auction: applyCategory.auction
              ? parseInt((applyCategory.auction as any).id)
              : applyCategory.coupang
              ? parseInt((applyCategory.coupang as any).auction)
              : 0,
            gmarket: applyCategory.gmarket
              ? parseInt((applyCategory.gmarket as any).id)
              : applyCategory.coupang
              ? parseInt((applyCategory.coupang as any).gmarket)
              : 0,
          },
        },
      });
      if (uploadRes.status === 200) {
        const workNum = Number(uploadRes.data.replace(regex.numRegex, ""));
        setRefetchInterval([
          ...refetchInterval,
          { workNum: workNum, isLoading: true },
        ]);
        handleSuccess(uploadRes.data);
      }
    } catch (e) {
      return handleAlert((e as any).response.data);
    }
  };

  return (
    <div className="row mt-3">
      <div className="col-12">
        <div className="d-flex align-items-center justify-content-center gap-3 mt-4">
          <button onClick={closeModal} className="cancel-btn">
            취소
          </button>
          <button onClick={confirmUpload} className="cancel-btn save-btn">
            등록
          </button>
        </div>
      </div>
      {successAlert && (
        <AlertOnlyClose
          message={successMessage}
          closeAlert={handleSuccess as () => void}
          additionalClose={closeModal}
        />
      )}
      {isAlert && (
        <AlertOnlyClose
          message={alertMessage}
          closeAlert={handleAlert as () => void}
        />
      )}
    </div>
  );
};
