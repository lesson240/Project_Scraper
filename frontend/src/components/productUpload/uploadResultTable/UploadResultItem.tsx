import { UploadSummary } from "@/interface/uploadinterface";
import { useEffect, useRef, useState } from "react";
import { UseMutationResult } from "react-query";
import { ItemCheckBox } from "./component/ItemCheckBox";
import { ItemProductInfo } from "./component/ItemProductInfo";
import { ItemFunction } from "./component/ItemFunction";
import { ItemDetailInfo } from "./component/ItemDetailInfo";
import taobaoIcon from "@/assets/images/marketIcon/taobao.svg";
import aliIcon from "@/assets/images/marketIcon/ali.svg";
import vvicIcon from "@/assets/images/marketIcon/vvic.svg";
import costcoIcon from "@/assets/images/marketIcon/costco.svg";
import icon1688 from "@/assets/images/marketIcon/1688.svg";
import { getSBLink } from "@/utils/functions/getSBLink";

interface Props {
  item: UploadSummary;
  setSelectedItem: React.Dispatch<React.SetStateAction<UploadSummary[]>>;
  selectedItem: UploadSummary[];
  isViewWayDetail: boolean;
  collectProductSummary: UseMutationResult<any, unknown, void, unknown>;
  page: number;
}

export const UploadResultItem = ({
  item,
  selectedItem,
  setSelectedItem,
  isViewWayDetail,
  collectProductSummary,
  page,
}: Props) => {
  const [isSelect, setIsSelect] = useState<boolean>(false);
  useEffect(() => {
    setIsSelect(
      Boolean(selectedItem.find((selected) => selected.id === item.id))
    );
  }, [selectedItem]);
  const clickSelect = () => {
    if (selectedItem.includes(item)) {
      setSelectedItem(selectedItem.filter((select) => item.id !== select.id));
    } else {
      setSelectedItem((prev) => [...prev, item]);
    }
  };

  useEffect(() => {
    const CurrentScroll = localStorage.getItem("scrollPosition");
    let PreviousScroll = 0;
    if (CurrentScroll && Number(CurrentScroll) !== PreviousScroll) {
      window.scrollTo({ top: Number(CurrentScroll), behavior: "auto" });
      PreviousScroll = Number(CurrentScroll);
    }
  }, []);
  return (
    <tr
      onClick={clickSelect}
      className={`uploadItem ${!isViewWayDetail && "simpleUploadItem"}`}
    >
      <ItemCheckBox isSelect={isSelect} />
      <td>
        <div className={`collect-inner-1 ${isSelect && "selectedItem"}`}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="d-flex align-items-center gap-2"
          >
            <img
              className="logoBtnBg"
              src={
                SITE_INDEX[
                  item?.site as "Costco" | "AliExpress" | "1688" | "VVIC"
                ]
              }
            />
            <button
              className="aTag madebutton"
              onClick={() => {
                getSBLink(item.code, item.productUrl);
              }}
            >
              {item.site}
            </button>
          </div>
        </div>
      </td>
      <ItemProductInfo
        isViewWayDetail={isViewWayDetail}
        item={item}
        isSelect={isSelect}
        collectProductSummary={collectProductSummary}
      />
      <ItemFunction
        item={item}
        isSelect={isSelect}
        collectProductSummary={collectProductSummary}
      />
      <ItemDetailInfo
        item={item}
        isSelect={isSelect}
        isViewWayDetail={isViewWayDetail}
      />
    </tr>
  );
};
const SITE_INDEX = {
  Taobao: taobaoIcon,
  AliExpress: aliIcon,
  Costco: costcoIcon,
  1688: icon1688,
  VVIC: vvicIcon,
};
