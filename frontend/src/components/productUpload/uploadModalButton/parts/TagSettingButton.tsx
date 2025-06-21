import { useAlert } from "@/hooks/useAlert";
import useToggle from "@/hooks/useToggle";
import { UploadSummary } from "@/interface/uploadinterface";
import { UseMutationResult } from "@tanstack/react-query";
import { TagSettingModal } from "../../modal/TagSettingModal";
import { AlertOnlyClose } from "@/components/alert/AlertOnlyClose";
import useFetch from "@/hooks/useFetch";
import useModal from "@/hooks/useModal";
import { useInfoWindow } from "@/hooks/useInfoWindow";

interface Props {
  selectedItem: UploadSummary[];
  collectProductSummary: UseMutationResult<any, unknown, void, unknown>;
  setSelectedItem: React.Dispatch<React.SetStateAction<UploadSummary[]>>;
}

export const TagSettingButton = ({
  selectedItem,
  collectProductSummary,
  setSelectedItem,
}: Props) => {
  const [getTagApi] = useFetch("tagAPI", "/UserConfig/GetNaverKeywordAPI");
  const openWindow = useInfoWindow();
  const { openModal } = useModal();

  const clickOpenModal = () => {
    if (!getTagApi.apiKey) return openWindow("태그 API설정이 필요합니다.");
    if (selectedItem.length === 0) {
      openWindow("상품을 선택해 주세요.\n선택된 상품이 없습니다.");
    } else {
      openModal(
        <TagSettingModal
          collectProductSummary={collectProductSummary}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
        />
      );
    }
  };
  return (
    <div>
      <button
        type="button"
        onClick={clickOpenModal}
        className="cancel-btn save-btn reset-btn name-set-btn"
      >
        태그 설정
      </button>
    </div>
  );
};
