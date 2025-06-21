import { OrangeMiddleButton } from "@/components/Button/allttamButton/OrangeMiddleButton";
import { CheckBoxInput } from "@/components/Input/CheckBoxInput";
import { ModalBg } from "@/components/ModalLayout/ModalBg";
import { ModalHead } from "@/components/ModalLayout/ModalHead";
import { ModalInnerTop } from "@/components/ModalLayout/ModalInnerTop";
import { FroalaEditor } from "@/components/shared/Froala/Froala";
import { QuestionMarkIcon } from "@/components/svg/QuestionMarkIcon";
import useFetch from "@/hooks/useFetch";
import { useInfoWindow } from "@/hooks/useInfoWindow";
import { DefaultInfo, UploadSummary } from "@/interface/uploadinterface";
import axiosInstance from "@/utils/axiosInstance";
import { base64toBlob } from "@/utils/functions/base64toBlob";
import { fileRequest } from "@/utils/functions/fileRequest";
import { urlToBase64 } from "@/utils/functions/urlToBase64";
import { useEffect, useMemo, useState } from "react";
import LoadingModal from "./component/LoadingModal";
import { PaymentResult } from "@/components/Payment/PaymentResult";
import useUser from "@/hooks/useUser";
import { DetailImgTemplates } from "./component/detailpage/DetailImgTemplates";
import { DetailImgPannel } from "./component/detailpage/DetailImgPannel";
import { DetailPageSetButton } from "./component/detailpage/DetailPageSetButton";
import { DetailEditorPlus } from "./component/detailpage/DetailEditorPlus";
import { extractUrl } from "./function/extractUrl";

interface Props {
  closeModal: () => void;
  item: UploadSummary;
}

export const EditDetailPageModal = ({ closeModal, item }: Props) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [model, setModel] = useState<string>("");
  const [fetchData, setFetchData] = useState<DefaultInfo>();
  const [pannelList, setPannelList] = useState<EditorId[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string>("");
  // const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [bulkList, setBulkList] = useState<string[]>([]);
  // const [editorId, setEditorId] = useState<EditorId[] | null>(null);
  const openWindow = useInfoWindow();

  const [getItemDefaultInfo] = useFetch(
    `itemInfo${item.id}`,
    `/Product/SearchCollectProductDetail?site=${item.site}&code=${item.code}`
  );

  useEffect(() => {
    if (getItemDefaultInfo) {
      setModel(getItemDefaultInfo.detailPageHtml);
      let deleteObj = getItemDefaultInfo;
      delete deleteObj.Id;
      setFetchData(deleteObj);

      setPannelList(
        extractUrl(getItemDefaultInfo.detailPageHtml)
          ?.filter((item) => {
            return (
              item.includes("alicdn.com") ||
              item.includes("allttam.com") ||
              item.includes("img.alicdn.com") ||
              item.includes("img1.vvic.com") ||
              item.includes("cbu01.alicdn.com")
            );
          })
          .map((item) => {
            return {
              originalUrl: item,
              id: "",
              link: "",
              resultUrl: "",
            };
          })
      );
    }
  }, [getItemDefaultInfo]);

  useEffect(() => {
    if (!model) return;
    const newArr = extractUrl(model)
      ?.filter((item) => {
        return (
          item.includes("alicdn.com") ||
          item.includes("allttam.com") ||
          item.includes("img.alicdn.com") ||
          item.includes("img1.vvic.com") ||
          item.includes("cbu01.alicdn.com")
        );
      })
      .map((item) => {
        return {
          originalUrl: item,
          id: "",
          link: "",
          resultUrl: "",
        };
      });

    const newPannelList = newArr.map((el) => {
      return pannelList.filter((url) => url.originalUrl === el.originalUrl)[0]
        ? pannelList.filter((url) => url.originalUrl === el.originalUrl)[0]
        : el;
    });

    setPannelList(newPannelList);
  }, [model]);

  const clickImgInEditor = (src: string) => {
    setSelectedUrl(src.replace("http:", "https:"));
  };

  const viewerIndex = useMemo(() => {
    return pannelList.findIndex((el) => el.originalUrl === selectedUrl);
  }, [selectedUrl]);

  const userInfo = useUser();

  const imgBulk = async () => {
    if (userInfo.plan !== "Unlimited") {
      return openWindow(
        "무제한 요금제 전용 기능 \n 코인충전소에서 무제한 요금제로 변경해주세요."
      );
    }
    if (!bulkList.length)
      return openWindow("이미지 패널에서 이미지를 선택해주세요");
    setIsLoading(true);
    openWindow("이미지 한장당 약 3초 소요됩니다.");
    try {
      let newModel = model;
      const newPannelList = [...pannelList];
      const imgsList = sliceImg(bulkList);

      const result = await Promise.all(
        imgsList.map(async (item) => {
          const res = await axiosInstance.post(
            `/Ohoo/Allddam/AutoImageTranslate?site=${getItemDefaultInfo.site}&code=${getItemDefaultInfo.code}`,
            item
          );

          return res.data.data;
        })
      );

      const blogList = await Promise.all(
        result.flat().map(async (item) => {
          const base64 = await urlToBase64(item.translateUrl);
          const blob = base64toBlob(base64);

          return {
            blob: blob,
            imageId: item.imageId,
            originUrl: item.originUrl,
          };
        })
      );
      let newPannel = [...pannelList];
      //패널리스트 안바뀌는 문제 확인
      for (let i in blogList) {
        const res = await fileRequest("/Image/UploadImage", blogList[i].blob);
        newModel = newModel.replace(
          result.flat()[i].originUrl.split(":")[1],
          res.link.split(":")[1]
        );

        newPannel = newPannel.map((el) => {
          if (
            el.originalUrl.split(":")[1] === blogList[i].originUrl.split(":")[1]
          ) {
            return {
              ...el,
              originalUrl: res.link,
              id: blogList[i].imageId,
            };
          }
          return el;
        });
      }
      setPannelList(newPannel);
      setModel(newModel);
      setBulkList([]);
    } catch (e) {
      openWindow("오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectBulkImgList = (url: string) => {
    if (bulkList.includes(url))
      setBulkList((prev) => prev.filter((item) => item !== url));
    else setBulkList([...bulkList, url]);
  };

  const isAllBulk = useMemo(
    () => bulkList?.length === pannelList?.length,
    [bulkList, pannelList]
  );

  const checkAllBulkList = () => {
    if (isAllBulk) {
      setBulkList([]);
    }
    if (!isAllBulk) {
      setBulkList(pannelList.map((item) => item.originalUrl));
    }
  };

  return (
    <ModalBg onClick={() => { }}>
      <ModalInnerTop width={1600}>
        <ModalHead clickClose={closeModal}>상세페이지</ModalHead>
        <div className="modal-body z-3 d-flex">
          <div className="width55 px-4">
            <div className="d-flex justify-content-between">
              <div className="d-flex gap-3 align-items-center">
                <p className="weight500 black text16 margin0">올땀 에디터</p>
                <QuestionMarkIcon />
              </div>
              <div className="d-flex gap-3">
                <OrangeMiddleButton onClick={imgBulk}>
                  이미지 대량번역
                </OrangeMiddleButton>
                <DetailEditorPlus
                  selectedUrl={selectedUrl}
                  model={model}
                  setModel={setModel}
                  setPannelList={setPannelList}
                />
              </div>
            </div>
            <div className="froala-container mt-3">
              <FroalaEditor
                height={500}
                model={model}
                setModel={setModel}
                item={item}
                placeholder="상세페이지의 내용을 입력해주세요."
                isEditor={true}
                clickImgInEditor={clickImgInEditor}
              />
            </div>
            <DetailPageSetButton
              closeModal={closeModal}
              fetchData={fetchData}
              model={model}
              queryKey={`itemInfo${item.id}`}
            />
          </div>
          <div className="width45 d-flex">
            <div className="width20">
              <div className="d-flex gap-3 align-items-center justify-content-center">
                <p className="weight500 text16 black margin0">이미지 패널</p>
                <QuestionMarkIcon />
              </div>
              <div
                className="d-flex gap-3 mt-2 pointer"
                onClick={checkAllBulkList}
              >
                <CheckBoxInput checked={isAllBulk} onClick={() => { }} />
                <p className="margin0">전체선택</p>
              </div>
              <div className="d-flex flex-col gap-3 detail-panner-container mt-4">
                {pannelList?.map((item, idx) => (
                  <img
                    key={idx}
                    src={`${item.originalUrl}`}
                    className={`pannelImg ${bulkList.includes(item.originalUrl) && "selected-bulk-img"
                      }`}
                    onClick={() => {
                      clickImgInEditor(item.originalUrl);
                      selectBulkImgList(item.originalUrl);
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="width80 px-3">
              <DetailImgPannel
                setSelectedUrl={setSelectedUrl}
                selectedUrl={selectedUrl}
                item={item}
                index={viewerIndex}
                // editorId={editorId ? editorId : []}
                // setEditorId={setEditorId}
                pannelList={pannelList}
                model={model}
                setModel={setModel}
                setPannelList={setPannelList}
              />
              <DetailImgTemplates />
            </div>
          </div>
        </div>
        {/* /isLoading &&  */}
        {isLoading && (
          <LoadingModal spinner={false}>
            <LoadingModal.LoadingProgressBar
              maxSecond={bulkList.length * 3.4}
            />
          </LoadingModal>
        )}
      </ModalInnerTop>
    </ModalBg>
  );
};

export interface EditorId {
  id: string;
  link: string;
  resultUrl: string;
  originalUrl: string;
}

const sliceImg = (imgList: string[]) => {
  const resultArray = [];

  for (let i = 0; i < imgList.length; i += 5) {
    const chunk = imgList.slice(i, i + 5);
    resultArray.push(chunk);
  }

  return resultArray;
};

interface TranslateType {
  originalUrl: string;
  translateUrl: string;
}
