import { useState } from "react";
import "cropperjs/dist/cropper.css";
import { ThumbNailBar } from "./component/editMainImg/ThumbNailBar";
import { UseMutationResult, useQueryClient } from "react-query";
import { UploadSummary } from "@/interface/uploadinterface";
import { fileRequest } from "@/utils/functions/fileRequest";
import { base64toBlob } from "@/utils/functions/base64toBlob";
import { upload } from "@/utils/functions/postApi";
import { ModalBg } from "@/components/ModalLayout/ModalBg";
import { ModalInnerTop } from "@/components/ModalLayout/ModalInnerTop";
import { ResetIcon } from "@/components/svg/ResetIcon";
import { ImgEditor } from "./component/imgeditor/ImgEditor";
import { WhiteBigButton } from "@/components/Button/allttamButton/WhiteBigButton";
import { GreenBigButton } from "@/components/Button/allttamButton/GreenBigButton";
import ModalContent from "@/components/shared/modal/ModalContent";
import useModal from "@/hooks/useModal";
import { useInfoWindow } from "@/hooks/useInfoWindow";

interface Props {
  item: UploadSummary;
  collectProductSummary: UseMutationResult<any, unknown, void, unknown>;
}
export const EditMainImgModal = ({ item, collectProductSummary }: Props) => {
  const { closeModal } = useModal();
  const openWindow = useInfoWindow();
  const queryclient = useQueryClient();
  const [imgList, setImgList] = useState<string[]>(item.mainImages);
  const [cropImg, setCropImg] = useState(imgList[0]);
  const [editIndex, setEditIndex] = useState(0);

  const clickReset = () => {
    setImgList(item.mainImages);
  };

  const applyImage = async (img: string) => {
    const uploadRes = await fileRequest(
      "/Image/UploadImage",
      base64toBlob(img)
    );
    const newArr = [...imgList];
    newArr[editIndex] = uploadRes.link;
    setImgList(newArr);
  };

  const setMainImg = async () => {
    const imgRes = await upload.editMainImg({
      code: item.code,
      urls: imgList,
    });
    if (imgRes === "성공했습니다.") {
      collectProductSummary.mutate();
      closeModal();
      openWindow("저장되었습니다.");
    }
  };

  return (
    <ModalContent>
      <ModalContent.ModalHead>썸네일</ModalContent.ModalHead>
      <ModalContent.ModalBody>
        <ThumbNailBar
          imgList={imgList}
          setImgList={setImgList}
          setCropImg={setCropImg}
          setEditIndex={setEditIndex}
        />
        <ImgEditor
          setCropImg={setCropImg}
          cropImg={cropImg}
          item={item}
          imgList={imgList}
          applyImage={applyImage}
        />
        <div className="row mt-4">
          <div className="col-12">
            <div className="d-flex align-items-center justify-content-center gap-3 mt-4">
              <WhiteBigButton onClick={clickReset}>
                <ResetIcon />
                초기화
              </WhiteBigButton>
              <GreenBigButton onClick={setMainImg}>저장</GreenBigButton>
            </div>
          </div>
        </div>
      </ModalContent.ModalBody>
    </ModalContent>
  );
};
