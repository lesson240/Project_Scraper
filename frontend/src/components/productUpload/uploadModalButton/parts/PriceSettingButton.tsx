import { useAlert } from "@/hooks/useAlert";
import useToggle from "@/hooks/useToggle";
import { UploadSummary } from "@/interface/uploadinterface";
import { UseMutationResult } from "react-query";
import { PriceSettingModal } from "../../modal/PriceSettingModal";
import { AlertOnlyClose } from "@/components/Alert/AlertOnlyClose";
import { useInfoWindow } from "@/hooks/useInfoWindow";
import useModal from "@/hooks/useModal";
import { Dispatch, SetStateAction } from "react";

interface Props {
  selectedItem: UploadSummary[];
  collectProductSummary: UseMutationResult<any, unknown, void, unknown>;
  setSelectedItem: React.Dispatch<React.SetStateAction<UploadSummary[]>>;
}

export const PriceSettingButton = ({
  selectedItem,
  collectProductSummary,
  setSelectedItem,
}: Props) => {
  const { openModal } = useModal();
  const openWindow = useInfoWindow();

  const clickOpenModal = () => {
    if (selectedItem.length === 0) {
      openWindow("상품을 선택해 주세요.\n선택된 상품이 없습니다.");
    } else {
      openModal(
        <PriceSettingModal
          selectedItem={selectedItem}
          collectProductSummary={collectProductSummary}
          setSelectedItem={setSelectedItem}
        />
      );
    }
  };
  return (
    <button
      onClick={clickOpenModal}
      type="button"
      data-bs-toggle="modal"
      data-bs-target="#exampleModal1"
      className="cancel-btn save-btn reset-btn name-set-btn"
    >
      가격 설정
    </button>
  );
};
