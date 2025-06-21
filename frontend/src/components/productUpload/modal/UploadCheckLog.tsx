import { useState } from "react";
import { CheckLogSmartStore } from "./component/checklog/CheckLogSmartStore";
import { CheckLogCoupang } from "./component/checklog/CheckLogCoupang";
import { CheckLogAuction } from "./component/checklog/CheckLogAuction";
import { CheckLogGamrkert } from "./component/checklog/CheckLogGmarket";
import { CheckLogElevenst } from "./component/checklog/CheckLogElevenst";
import { MarketEnglishLower, UploadSummary } from "@/interface/uploadinterface";
import useFetch from "@/hooks/useFetch";
import { UploadLog } from "@/interface/defaultinterface";
import { ModalBg } from "@/components/ModalLayout/ModalBg";
import { ModalInnerTop } from "@/components/ModalLayout/ModalInnerTop";

interface Props {
  closeModal: () => void;
  item: UploadSummary;
}

export const UploadCheckLog = ({ closeModal, item }: Props) => {
  const [tabValue, setTabValue] = useState<MarketEnglishLower>("smartstore");
  const [uploadLogs] = useFetch(
    `uploadLog${item.id}`,
    `/Product/GetProductUploadLog?ObjectId=${item.id}`
  );
  const selectTab = (e: React.MouseEvent<HTMLButtonElement>) => {
    setTabValue(e.currentTarget.value as MarketEnglishLower);
  };

  const TAB_INDEX = {
    smartstore: (
      <CheckLogSmartStore
        logList={uploadLogs?.filter(
          (item: UploadLog) => item.market === "SmartStore"
        )}
        itemCode={item?.code}
      />
    ),
    coupang: (
      <CheckLogCoupang
        logList={uploadLogs?.filter(
          (item: UploadLog) => item.market === "Coupang"
        )}
        itemCode={item?.code}
      />
    ),
    auction: (
      <CheckLogAuction
        logList={uploadLogs?.filter(
          (item: UploadLog) => item.market === "Auction"
        )}
        itemCode={item?.code}
      />
    ),
    gmarket: (
      <CheckLogGamrkert
        logList={uploadLogs?.filter(
          (item: UploadLog) => item.market === "Gmarket"
        )}
        itemCode={item?.code}
      />
    ),
    elevenst: (
      <CheckLogElevenst
        logList={uploadLogs?.filter(
          (item: UploadLog) => item.market === "Elevenst"
        )}
        itemCode={item?.code}
      />
    ),
  };

  return (
    <ModalBg onClick={closeModal}>
      <ModalInnerTop>
        <>
          <div className="modal-header modal-sticky">
            <h5
              className="modal-title d-flex align-items-center"
              id="exampleModalLabel"
            >
              업로드 로그
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={closeModal}
            ></button>
          </div>
          <div className="modal-body smart-store-tabs">
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <button
                  onClick={selectTab}
                  value="smartstore"
                  className={`nav-link ${
                    tabValue === "smartstore" && "active"
                  }`}
                >
                  스마트스토어
                </button>
              </li>
              <li className="nav-item">
                <button
                  onClick={selectTab}
                  value="coupang"
                  className={`nav-link ${tabValue === "coupang" && "active"}`}
                >
                  쿠팡
                </button>
              </li>
              <li className="nav-item">
                <button
                  onClick={selectTab}
                  value="auction"
                  className={`nav-link ${tabValue === "auction" && "active"}`}
                >
                  옥션
                </button>
              </li>
              <li className="nav-item">
                <button
                  onClick={selectTab}
                  value="gmarket"
                  className={`nav-link ${tabValue === "gmarket" && "active"}`}
                >
                  지마켓
                </button>
              </li>
              <li className="nav-item">
                <button
                  onClick={selectTab}
                  value="elevenst"
                  className={`nav-link ${tabValue === "elevenst" && "active"}`}
                >
                  11번가
                </button>
              </li>
            </ul>
            {TAB_INDEX[tabValue]}
          </div>
        </>
      </ModalInnerTop>
    </ModalBg>
  );
};
