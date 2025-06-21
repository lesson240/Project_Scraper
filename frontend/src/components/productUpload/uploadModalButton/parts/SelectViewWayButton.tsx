import { Tooltip } from "react-bootstrap";
import { useTooltip } from "@/hooks/useTooltip";
import { UploadTooltip } from "../../tollTip/UploadTooltip";
import { ViewWayDefaultIcon } from "@/components/svg/ViewWayDefaultIcon";
import { ViewWayDetailIcon } from "@/components/svg/ViewWayDetailIcon";

interface Props {
  setIsViewWayDetail: React.Dispatch<React.SetStateAction<boolean>>;
  isViewWayDetail: boolean;
}

export const SelectViewWayButton = ({
  setIsViewWayDetail,
  isViewWayDetail,
}: Props) => {
  const [isTooltipSimple, onSimple, offSimple] = useTooltip();
  const [isTooltipDetail, onDetail, offDetail] = useTooltip();
  const selectViewWay = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsViewWayDetail(e.currentTarget.value === "true");
  };

  return (
    <div className="d-flex">
      <div className="tooltipRel">
        {isTooltipSimple && <UploadTooltip>간단보기</UploadTooltip>}
        <button
          onClick={selectViewWay}
          value="false"
          className={`d-flex align-items-center justify-content-center madebutton paddingZero wayButtonLeft ${!isViewWayDetail && "waySelected"
            }`}
          onMouseEnter={onSimple as () => void}
          onMouseLeave={offSimple as () => void}
        >
          <ViewWayDefaultIcon />
        </button>
      </div>
      <div className="wayDivider" />
      <div className="tooltipRel">
        {isTooltipDetail && <UploadTooltip>상세보기</UploadTooltip>}
        <button
          onClick={selectViewWay}
          value="true"
          className={`d-flex align-items-center justify-content-center madebutton paddingZero wayButtonRight ${isViewWayDetail && "waySelected"
            }`}
          onMouseEnter={onDetail as () => void}
          onMouseLeave={offDetail as () => void}
        >
          <ViewWayDetailIcon />
        </button>
      </div>
    </div>
  );
};
