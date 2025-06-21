import { useEffect, useState } from "react";
import { EditDefaultSetTag } from "./component/editdefaultinfo/EditDefaultSetTag";
import { EditDefaultSetDesc } from "./component/editdefaultinfo/EditDefaultSetDesc";
import { EditDefaultSetImg } from "./component/editdefaultinfo/EditDefaultSetImg";
import { EditDefaultSetInfo } from "./component/editdefaultinfo/EditDefaultSetInfo";
import { EditDefaultSetButton } from "./component/editdefaultinfo/EditDefaultSetButton";
import { Desc, UploadSummary } from "@/interface/uploadinterface";
import useFetch from "@/hooks/useFetch";
import { TitleType } from "@/interface/productmanageinterface";
import { ModalBg } from "@/components/ModalLayout/ModalBg";
import { ModalInnerTop } from "@/components/ModalLayout/ModalInnerTop";

interface Props {
  closeModal: () => void;
  item: UploadSummary;
}
export const UploadEditDefaultInfoModal = ({ closeModal, item }: Props) => {
  const [getItemDefaultInfo] = useFetch(
    `itemInfo${item.id}`,
    `/Product/SearchCollectProductDetail?site=${item.site}&code=${item.code}`
  );
  const [editValue, setEditValue] = useState({
    productName: "",
    productPrice: "",
    memo: "",
  });
  const [tagList, setTagList] = useState<string[]>([]);
  const [descList, setDescList] = useState<Desc[]>([]);
  const [imgList, setImgList] = useState<string[]>([]);

  useEffect(() => {
    if (getItemDefaultInfo) {
      setEditValue({
        productName: getItemDefaultInfo.title.filter(
          (item: TitleType) => item.language === "KR"
        )[0].text,
        productPrice: getItemDefaultInfo.price[1].originalPrice,
        memo: getItemDefaultInfo.memo ? getItemDefaultInfo.memo : "",
      });
      setTagList(getItemDefaultInfo.tags ? getItemDefaultInfo.tags : []);
      setDescList(
        getItemDefaultInfo.descs?.filter((item: Desc) => item.language === "KR")
          ? getItemDefaultInfo.descs?.filter(
              (item: Desc) => item.language === "KR"
            )
          : []
      );
      setImgList(getItemDefaultInfo.mainImages);
    }
  }, [getItemDefaultInfo]);

  return (
    <ModalBg onClick={() => {}}>
      <ModalInnerTop>
        <>
          <div className="modal-header modal-sticky">
            <h5 className="modal-title d-flex align-items-center">속성</h5>
            <button
              type="button"
              className="btn-close"
              onClick={closeModal}
            ></button>
          </div>
          <div className="modal-body">
            <EditDefaultSetDesc descList={descList} setDescList={setDescList} />
            <EditDefaultSetButton
              editValue={editValue}
              tagList={tagList}
              descList={descList}
              imgList={imgList}
              getItemDefaultInfo={getItemDefaultInfo}
              closeModal={closeModal}
            />
          </div>
        </>
      </ModalInnerTop>
    </ModalBg>
  );
};
