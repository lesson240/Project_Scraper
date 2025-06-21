import { useEffect, useState } from "react";

import ModalContent from "@/components/shared/modal/ModalContent";
import useFetch from "@/hooks/useFetch";
import { DetailPageHTMLEditor } from "./component/detailpagesetting/DetailPageHTMLEditor";
import { DetailPageSettingOption } from "./component/detailpagesetting/DetailPageSettingOption";

export const DetailPageSettingModal = () => {
  const [topModel, setTopModel] = useState("");
  const [bottomModel, setBottomModel] = useState("");
  const [editorState, setEditorState] = useState("top");
  const [selectValue, setSelectValue] = useState({
    style: "",
    fontSize: "",
    placementOrder: "",
  });
  const [isUseHTMLSetting, setIsUseHTMLSetting] = useState({
    detailPageTop: false,
    top: false,
    bottom: false,
  });
  const [detailPageConfig] = useFetch(
    "detailPageConfig",
    "/Market/GetDetailPageConfig"
  );

  useEffect(() => {
    if (detailPageConfig) {
      setSelectValue({
        placementOrder: detailPageConfig?.collocate,
        style: detailPageConfig.addOptionImageConfig?.style,
        fontSize: detailPageConfig.addOptionImageConfig?.fontSize,
      });
      setIsUseHTMLSetting({
        detailPageTop: detailPageConfig?.useDesc,
        top: detailPageConfig.addContent?.useTopContent,
        bottom: detailPageConfig.addContent?.useBottomContent,
      });
      setTopModel(detailPageConfig.addContent?.topHtml);
      setBottomModel(detailPageConfig.addContent?.bottomHtml);
    }
  }, [detailPageConfig]);

  const SelectselectValue = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSelectValue({
      ...selectValue,
      [name]: value,
    });
  };

  const selectTopBottomEditorState = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    setEditorState(e.currentTarget.value);
  };

  const clickReset = () => {
    setSelectValue({
      placementOrder: detailPageConfig?.collocate,
      style: detailPageConfig.addOptionImageConfig?.style,
      fontSize: detailPageConfig.addOptionImageConfig?.fontSize,
    });
    setIsUseHTMLSetting({
      detailPageTop: detailPageConfig?.useDesc,
      top: detailPageConfig.addContent?.useTopContent,
      bottom: detailPageConfig.addContent?.useBottomContent,
    });
    setTopModel(detailPageConfig.addContent?.topHtml);
    setBottomModel(detailPageConfig.addContent?.bottomHtml);
  };

  return (
    <ModalContent width={1600}>
      <ModalContent.ModalHead>
        <h5 className="modal-title d-flex align-items-center">
          상세페이지 설정{" "}
        </h5>
      </ModalContent.ModalHead>
      <div className="modal-body">
        <DetailPageSettingOption
          topModel={topModel}
          bottomModel={bottomModel}
          setIsUseHTMLSetting={setIsUseHTMLSetting}
          isUseHTMLSetting={isUseHTMLSetting}
          SelectselectValue={SelectselectValue}
          selectValue={selectValue}
          clickReset={clickReset}
        />
        <div className="mt-3 froalaSelectBox">
          <button
            onClick={selectTopBottomEditorState}
            value="top"
            className={`madebutton widthHalf ${
              editorState === "top" && "selectedStateBox"
            }`}
          >
            상단 내용
          </button>
          <div />
          <button
            onClick={selectTopBottomEditorState}
            value="bottom"
            className={`madebutton widthHalf ${
              editorState === "bottom" && "selectedStateBox"
            }`}
          >
            하단 내용
          </button>
        </div>
        <DetailPageHTMLEditor
          editorState={editorState}
          topModel={topModel}
          setTopModel={setTopModel}
          setBottomModel={setBottomModel}
          bottomModel={bottomModel}
        />
      </div>
    </ModalContent>
  );
};
