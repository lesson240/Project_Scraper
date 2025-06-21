import { AlertConfirmAndClose } from "@/components/Alert/AlertConfirmAndClose";
import { useInfoWindow } from "@/hooks/useInfoWindow";
import useModal from "@/hooks/useModal";
import { useTooltip } from "@/hooks/useTooltip";
import { UploadSummary } from "@/interface/uploadinterface";
import { upload } from "@/utils/functions/postApi";
import { UseMutationResult } from "react-query";
import { UploadTooltip } from "../../Tooltip/UploadTooltip";

interface Props {
  selectedItem: UploadSummary[];
  collectProductSummary: UseMutationResult<any, unknown, void, unknown>;
  setSelectedItem: React.Dispatch<React.SetStateAction<UploadSummary[]>>;
}

export const ProductDeleteButton = ({
  selectedItem,
  collectProductSummary,
  setSelectedItem,
}: Props) => {
  const [isTooltip, handleMouseOn, handleMouseOff] = useTooltip();
  const { openModal, closeModal } = useModal();
  const openWindow = useInfoWindow();

  const clickOpenModal = () => {
    if (selectedItem.length === 0) {
      openWindow("선택된 상품이 없습니다.");
    } else {
      openModal(
        <AlertConfirmAndClose
          message={`선택하신 ${selectedItem.length}개 상품을 삭제하시겠습니까?`}
          confirmDoing={confirmDelete}
        />
      );
    }
  };

  const confirmDelete = async () => {
    const deleteRes = await upload.deleteProduct(
      selectedItem.map((item) => {
        return item.code;
      })
    );
    closeModal();
    if (deleteRes === "성공하였습니다.") {
      openWindow("상품을 성공적으로 삭제했습니다.");
      collectProductSummary.mutate();
      setSelectedItem([]);
    }
  };

  return (
    <div className="tooltipRel">
      {isTooltip && (
        <UploadTooltip>상품DB를 서버에서 삭제합니다.</UploadTooltip>
      )}
      <button
        className="cancel-btn save-btn reset-btn del-btn"
        onClick={clickOpenModal}
        onMouseEnter={handleMouseOn as () => void}
        onMouseLeave={handleMouseOff as () => void}
      >
        상품 삭제
      </button>
    </div>
  );
};
