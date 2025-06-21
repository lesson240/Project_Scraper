import { GreenBigButton } from "@/components/Button/allttamButton/GreenBigButton";
import ModalContent from "@/components/shared/modal/ModalContent";
import { useInfoWindow } from "@/hooks/useInfoWindow";
import useModal from "@/hooks/useModal";
import { useScroll } from "@/hooks/useScroll";
import { Keyword, UploadSummary } from "@/interface/uploadinterface";
import { comparePriority } from "@/utils/functions/compareGrade";
import { upload } from "@/utils/functions/postApi";
import { compareValues } from "@/utils/functions/settingTagCompare";
import { useEffect, useState } from "react";
import { UseMutationResult } from "react-query";
import { ResetButton } from "@/components/Productmanage/ProductManageSearchingBoard/component/button/ResetButton";
import { KeywordList } from "./component/TagSetting/KeywordList";
import { KeywordSearching } from "./component/TagSetting/KeywordSearching";
import { ProductNameKeywordList } from "./component/TagSetting/ProductNameKeywordList";
import { TagFiltering } from "./component/TagSetting/TagFiltering";
import { TagInputDirect } from "./component/TagSetting/TagInputDirect";
import { TagList } from "./component/TagSetting/TagList";
import { TagSettingTable } from "./component/TagSetting/TagSettingTable";

interface Props {
  selectedItem: UploadSummary[];
  collectProductSummary: UseMutationResult<any, unknown, void, unknown>;
  setSelectedItem: React.Dispatch<React.SetStateAction<UploadSummary[]>>;
}

export const TagSettingModal = ({
  selectedItem,
  collectProductSummary,
  setSelectedItem,
}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const { closeModal } = useModal();
  const [keywordValue, setKeyWordValue] = useState("");
  const { count, scrollEvent } = useScroll(45);
  const [selectedTag, setSelectedTag] = useState<string[]>([]);
  const [searchAdKeywordList, setSearchAdKeywordList] = useState<Keyword[]>([]);
  const [crawledKeyword, setCrawledKeyword] = useState<CrawledKeyword>({
    rel: [],
    auto: [],
  });

  const inputKeyWord = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyWordValue(e.target.value);
  };
  const openWindow = useInfoWindow();
  const [renderData, setRenderData] = useState<Keyword[]>([]);
  const [sortData, setSortData] = useState<Keyword[]>([]);

  useEffect(() => {
    setSortData(searchAdKeywordList);
  }, [searchAdKeywordList]);

  useEffect(() => {
    setRenderData(sortData?.slice(0, 100 * count));
  }, [sortData, count]);

  const clickSort = (keyword: string, sortWay: "desc" | "asc") => {
    if (!sortData) {
      return;
    }
    setSortData(
      [...sortData].sort((a: any, b: any) => {
        switch (true) {
          case isNaN(a[keyword]) && isNaN(b[keyword]):
            return compareValues(a, b, keyword, sortWay);
          case isNaN(a[keyword]):
            return sortWay === "desc" ? 1 : -1;
          case isNaN(b[keyword]):
            return sortWay === "desc" ? -1 : 1;
          default:
            return compareValues(a, b, keyword, sortWay);
        }
      })
    );
  };

  const clickSortLiteral = (keyword: string, sortWay: "desc" | "asc") => {
    if (!sortData) {
      return;
    }
    setSortData(
      [...sortData].sort((a: any, b: any) => {
        const valueA =
          typeof a[keyword] === "string"
            ? a[keyword].toLowerCase()
            : a[keyword];
        const valueB =
          typeof b[keyword] === "string"
            ? b[keyword].toLowerCase()
            : b[keyword];
        return sortWay === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      })
    );
  };

  const clickSortGrade = (keyword: string, sortWay: "desc" | "asc") => {
    if (!sortData) {
      return;
    }
    setSortData(
      [...sortData].sort((a: any, b: any) => {
        const valueA = comparePriority(a[keyword]);
        const valueB = comparePriority(b[keyword]);
        return sortWay === "asc" ? valueA - valueB : valueB - valueA;
      })
    );
  };

  const clickReset = () => {
    setSelectedTag([]);
  };

  const confirmSetTag = async () => {
    const newArr = selectedTag.filter(
      (item, idx, self) => self.indexOf(item) === idx
    );

    if (newArr.length === 0) {
      openWindow(`태그를 선택해주세요.\n 태그가 선택되지 않았습니다.`);
      return;
    }

    const setTagRes = await upload.setTag({
      objectIds: selectedItem.map((item) => item.id),
      tags: newArr,
    });

    if (setTagRes === "성공했습니다.") {
      collectProductSummary.mutate();
      openWindow(`태그 설정이 완료되었습니다.\n 상품 ${selectedItem.length}건`);
      setSelectedItem((prev) => {
        const updatedItems = [...prev];
        updatedItems.map((item) => {
          item.tags = newArr;
        });
        return updatedItems;
      });
      closeModal();
    }
  };

  return (
    <ModalContent width={1600}>
      <ModalContent.ModalHead>
        <h5
          className="modal-title d-flex align-items-center"
          id="exampleModalLabel"
        >
          태그 설정
          <span className="three-selected">
            선택상품 {selectedItem?.length}개
          </span>
        </h5>
      </ModalContent.ModalHead>
      <ModalContent.ModalBody>
        <div className="d-flex gap-5">
          <div className="width35 d-flex flex-col justify-content-between">
            <div>
              <ProductNameKeywordList
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                selectedItem={selectedItem}
                setCrawledKeyword={setCrawledKeyword}
              />
              <KeywordSearching
                isLoading={isLoading}
                setCrawledKeyword={setCrawledKeyword}
                setIsLoading={setIsLoading}
                setSearchAdKeywordList={setSearchAdKeywordList}
              />
              <TagInputDirect setSelectedTag={setSelectedTag} />
              <TagList
                selectedTag={selectedTag}
                setSelectedTag={setSelectedTag}
              />
            </div>
            <div className="d-flex align-items-center justify-content-center gap-3 mt-4">
              <ResetButton onClick={clickReset} />
              <GreenBigButton onClick={confirmSetTag}>저장</GreenBigButton>
            </div>
          </div>
          <div className="width65">
            <KeywordList
              isLoading={isLoading}
              crawledKeyword={crawledKeyword}
              setSelectedTag={setSelectedTag}
            />
            <TagFiltering
              rawData={searchAdKeywordList}
              setSortData={setSortData}
              sortData={sortData}
              selectedTag={selectedTag}
              setSelectedTag={setSelectedTag}
            />
            <div className="widthFull">
              <TagSettingTable
                clickSortGrade={clickSortGrade}
                clickSortLiteral={clickSortLiteral}
                clickSort={clickSort}
                keywordList={renderData}
                selectedTag={selectedTag}
                setSelectedTag={setSelectedTag}
                scrollEvent={scrollEvent}
              />
            </div>
          </div>
        </div>
      </ModalContent.ModalBody>
    </ModalContent>
  );
};

export interface CrawledKeyword {
  rel: string[];
  auto: string[];
}
