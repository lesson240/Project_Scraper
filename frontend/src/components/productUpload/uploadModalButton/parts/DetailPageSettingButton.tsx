import { AlertOnlyClose } from "@/components/alert/AlertOnlyClose";
import { useAlert } from "@/hooks/useAlert";
import useToggle from "@/hooks/useToggle";
import { UploadSummary } from "@/interface/uploadinterface";
import { DetailPageSettingModal } from "../../modal/DetailPageSettingModal";
import useModal from "@/hooks/useModal";

interface Props {
  selectedItem: UploadSummary[];
}

export const DetailPageSettingButton = ({ selectedItem }: Props) => {
  const { openModal } = useModal();
  return (
    <div>
      <button
        type="button"
        onClick={() => openModal(<DetailPageSettingModal />)}
        className="cancel-btn save-btn reset-btn name-set-btn"
      >
        상세페이지 설정
      </button>
    </div>
  );
};
