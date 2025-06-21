import { useEffect, useMemo, useState } from "react";
import { UseMutationResult, useQueryClient } from "react-query";
import {
  DetailOptionType,
  OptionGroupType,
  OptionName,
  Price,
  UploadSummary,
} from "@/interface/uploadinterface";
import useFetch from "@/hooks/useFetch";
import { ModalBg } from "@/components/ModalLayout/ModalBg";
import { ModalInnerTop } from "@/components/ModalLayout/ModalInnerTop";
import { useInfoWindow } from "@/hooks/useInfoWindow";
import { ModalHead } from "@/components/ModalLayout/ModalHead";
import { ModalBody } from "@/components/ModalLayout/ModalBody";
import { OptionList } from "./component/option/OptionList";
import { OptionNameSetting } from "./component/option/OptionNameSetting";

interface Props {
  closeModal: () => void;
  item: UploadSummary;
  collectProductSummary: UseMutationResult<any, unknown, void, unknown>;
}

export const UploadEditOptionModal = ({
  closeModal,
  item,
  collectProductSummary,
}: Props) => {
  const openWindow = useInfoWindow();
  const queryClient = useQueryClient();
  const [optionList] = useFetch(
    `productOption${item.code}`,
    `/Product/SearchCollectProductDetail?site=${item.site}&code=${item.code}`,
    1000
  );

  const [optionGroups, setOptionGroups] = useState<OptionGroupType[]>([]);
  const [detailOptionList, setDetailOptionList] = useState<DetailOptionType[]>(
    []
  );
  const [selectedDetailOption, setSelectedDetailOption] = useState<
    DetailOptionType[]
  >([]);

  const info = useMemo(() => {
    if (!optionList) return;
    return {
      language: optionList.option.optionGroups[0]?.groupName.filter(
        (item: OptionName) => item.language !== "KR"
      )[0].language,
      price: optionList.option.detailOptions[0]?.price.filter(
        (item: Price) => item.currency !== "KRW"
      )[0].currency,
    };
  }, [optionList]);

  useEffect(() => {
    if (!optionList) return;
    if (
      optionList?.option.optionGroups.length === 0 &&
      optionList?.option.detailOptions.length === 0
    ) {
      openWindow("옵션이 없는 상품입니다.");
      return closeModal();
    }
    setOptionGroups(optionList?.option.optionGroups);
    setDetailOptionList(optionList?.option.detailOptions);

    // setOptionGroups(optionList.)
    // if (optionList) {
    //   const insertIndex: OptionGroupType[] = insertOptionIndex(optionList);
    //   setOptionGroups(insertIndex as OptionGroupType[]);

    //   if (insertIndex.length > 1) {
    //     const optionGroup1 = insertIndex[0];
    //     const optionGroup2 = insertIndex[1];

    //     if (!optionGroup2) return;
    //     setDetailOptionList(
    //       optionList.option.detailOptions.map((item: DetailOptionType) => {
    //         const firstName = item.optionName
    //           .find((item) => item.language === "KR")
    //           ?.text.split("//")[0];

    //         const secondName = item.optionName
    //           .find((item) => item.language === "KR")
    //           ?.text.split("//")[1];

    //         const firstIndex = optionGroup1.groups.find(
    //           (item) =>
    //             item.optionName.find((item) => item.language === "KR")?.text ===
    //             firstName
    //         )?.indexId;

    //         const secondIndex = optionGroup2.groups.find(
    //           (item) =>
    //             item.optionName.find((item) => item.language === "KR")?.text ===
    //             secondName
    //         )?.indexId;

    //         return {
    //           ...item,
    //           priceIndex: `${firstIndex}${secondIndex}`,
    //         };
    //       })
    //     );
    //   }
    //   if (insertIndex.length === 1) {
    //     const optionGroup1 = insertIndex[0];
    //     setDetailOptionList(
    //       optionList.option.detailOptions.map((item: DetailOptionType) => {
    //         const firstName = item.optionName
    //           .find((item) => item.language === "KR")
    //           ?.text.split("//")[0];

    //         const firstIndex = optionGroup1.groups.find(
    //           (item) =>
    //             item.optionName.find((item) => item.language === "KR")?.text ===
    //             firstName
    //         )?.indexId;

    //         return {
    //           ...item,
    //           priceIndex: `${firstIndex}`,
    //         };
    //       })
    //     );
    //   }
    // }
  }, [optionList]);

  return (
    <ModalBg onClick={() => {}}>
      <ModalInnerTop width={1600}>
        <>
          <ModalHead clickClose={closeModal}>옵션</ModalHead>
          <ModalBody>
            <div className="widthFull d-flex">
              <OptionNameSetting
                item={item}
                info={info}
                optionGroups={optionGroups}
                setOptionGroups={setOptionGroups}
                detailOptionList={detailOptionList}
                setDetailOptionList={setDetailOptionList}
              />
              <OptionList
                collectProductSummary={collectProductSummary}
                closeModal={closeModal}
                item={item}
                optionList={optionList}
                setDetailOptionList={setDetailOptionList}
                optionGroups={optionGroups}
                detailOptionList={detailOptionList}
                setSelectedDetailOption={setSelectedDetailOption}
                selectedDetailOption={selectedDetailOption}
              />
            </div>
          </ModalBody>
        </>
      </ModalInnerTop>
    </ModalBg>
  );
};
