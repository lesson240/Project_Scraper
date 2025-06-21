import { useAlert } from "@/hooks/useAlert";
import useToggle from "@/hooks/useToggle";
import { useTooltip } from "@/hooks/useTooltip";
import { UploadSummary } from "@/interface/uploadinterface";
import { UploadTooltip } from "../../tollTip/UploadTooltip";
import { AlertOnlyClose } from "@/components/alert/AlertOnlyClose";
import { ProductUploadModal } from "../../modal/ProductUploadModal";
import useModal from "@/hooks/useModal";
import { useInfoWindow } from "@/hooks/useInfoWindow";

interface Props {
  selectedItem: UploadSummary[];
}

export const ProductUploadButton = ({ selectedItem }: Props) => {
  const [isTooltip, handleMouseOn, handleMouseOff] = useTooltip();
  const { openModal } = useModal();
  const openWindow = useInfoWindow();

  const clickOpenModal = () => {
    try {
      if (selectedItem.length === 0) {
        openWindow("상품을 선택해 주세요.\n선택된 상품이 없습니다.");
        return;
      }
      selectedItem.map((item) => {
        const ItemName = item.title.map((name) => {
          return name.language === "KR" && name.text;
        });

        if (
          !item.tags &&
          item.minimumPrice.filter((prices) => prices.currency === "KRW")[0]
            ?.salePrice === 0
        ) {
          throw `가격과 태그 설정을 완료해주세요.\n상품 : ${ItemName[1]}`;
        }
        if (!item.tags?.length)
          throw `태그 설정을 완료해주세요.\n상품 : ${ItemName[1]} `;

        if (
          item.minimumPrice.filter((prices) => prices.currency === "KRW")[0]
            .salePrice === 0
        )
          throw `가격 설정을 완료해주세요.\n상품 : ${ItemName[1]}`;
      });
      openModal(<ProductUploadModal selectedItem={selectedItem} />);
    } catch (error: any) {
      openWindow(error);
    }
  };

  return (
    <div className="tooltipRel">
      {isTooltip && (
        <UploadTooltip>상품DB를 오픈마켓에 판매등록합니다.</UploadTooltip>
      )}
      <button
        onMouseEnter={handleMouseOn as () => void}
        onMouseLeave={handleMouseOff as () => void}
        type="button"
        onClick={clickOpenModal}
        className="cancel-btn save-btn reset-btn del-btn sale-reg-btn"
      >
        판매등록
      </button>
    </div>
  );
};
