import { useInfoWindow } from "@/hooks/useInfoWindow";
import useModal from "@/hooks/useModal";
import { UploadSummary } from "@/interface/uploadinterface";
import { UseMutationResult } from "react-query";
import { ProductNameSettingModal } from "../../modal/ProductNameSettingModal";

interface Props {
  selectedItem: UploadSummary[];
  collectProductSummary: UseMutationResult<any, unknown, void, unknown>;
  setSelectedItem: React.Dispatch<React.SetStateAction<UploadSummary[]>>;
}

export const ProductNameSettingButton = ({
  selectedItem,
  collectProductSummary,
  setSelectedItem,
}: Props) => {
  const openWindow = useInfoWindow();
  const { openModal } = useModal();

  const clickOpenModal = () => {
    if (selectedItem.length === 0) {
      openWindow("선택된 상품이 없습니다.");
    } else {
      openModal(
        <ProductNameSettingModal
          setSelectedItem={setSelectedItem}
          collectProductSummary={collectProductSummary}
          selectedItem={selectedItem}
        />
      );
    }
  };

  return (
    <button
      type="button"
      onClick={clickOpenModal}
      className="cancel-btn save-btn reset-btn name-set-btn"
    >
      상품명 설정
    </button>
  );
};
