import { XCircleIcon } from "@/components/svg/XCircleIcon";
import useFetch from "@/hooks/useFetch";
import { useScroll } from "@/hooks/useScroll";
import {
  Category,
  CategorySearchKeyword,
  MarketEnglish,
  MarketKorean,
} from "@/interface/uploadinterface";
import { useEffect, useRef, useState } from "react";
import { Spinner } from "react-bootstrap";

interface Props {
  searchKeyword: CategorySearchKeyword;
  title: MarketKorean;
  isAutoMapping: boolean;
  setCategory: React.Dispatch<React.SetStateAction<Category | undefined>>;
  market: MarketEnglish;
  setSearchKeyWord: React.Dispatch<React.SetStateAction<CategorySearchKeyword>>;
}

export const UploadCoupangCategory = ({
  market,
  isAutoMapping,
  setCategory,
  title,
  setSearchKeyWord,
  searchKeyword,
}: Props) => {
  const [isInputFocus, setIsInputFocus] = useState(false);
  const [renderData, setRenderData] = useState([]);
  const { count, scrollEvent } = useScroll(33);
  const [getMarketCategory, refetch, isLoading, isError] = useFetch(
    [`${market}Category`, searchKeyword[market]],
    `${
      title === "쿠팡"
        ? `/CategoryMapping/SearchCategory?word=${searchKeyword["Coupang"]}`
        : `/UserSetting/GetCategory?market=${market}&upper1=${searchKeyword[market]}`
    }`
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const selectBoxRef = useRef<HTMLDivElement>(null);
  const inputKeyword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyWord({ ...searchKeyword, [market]: e.target.value });
  };

  const clickInputBox = () => {
    setIsInputFocus(true);
  };

  const clickEraseButton = () => {
    setSearchKeyWord({
      ...searchKeyword,
      [market]: "",
    });
    setCategory((prev: any) => {
      return {
        ...prev,
        [market]: "",
      };
    });
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (
      selectBoxRef.current &&
      !selectBoxRef.current.contains(e.target as Node)
    ) {
      setIsInputFocus(false);
    }
  };

  const selectCategory = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isAutoMapping && market === "Coupang") {
      setSearchKeyWord({
        Coupang: getMarketCategory?.[e.currentTarget.value]["coupangName"],
        Elevenst: getMarketCategory?.[e.currentTarget.value]["elevenstName"],
        Gmarket: getMarketCategory?.[e.currentTarget.value]["gmarketName"],
        Auction: getMarketCategory?.[e.currentTarget.value]["auctionName"],
        SmartStore:
          getMarketCategory?.[e.currentTarget.value]["smartstoreName"],
      });
      setCategory({
        Auction: null,
        Gmarket: null,
        Elevenst: null,
        SmartStore: null,
        Coupang: getMarketCategory?.[e.currentTarget.value],
      });
    } else {
      setCategory((prev: any) => {
        return {
          ...prev,
          [market]: getMarketCategory?.[e.currentTarget.value],
        };
      });
      setSearchKeyWord({
        ...searchKeyword,
        [market]:
          market === "Coupang"
            ? getMarketCategory?.[e.currentTarget.value].coupangName
            : `${getMarketCategory?.[e.currentTarget.value]
                .largeName} > ${getMarketCategory?.[e.currentTarget.value]
                .middleName} > ${getMarketCategory?.[e.currentTarget.value]
                .smallName}${
                getMarketCategory?.[e.currentTarget.value].detailName !== null
                  ? ` > ${getMarketCategory?.[e.currentTarget.value]
                      .detailName}`
                  : ""
              }`,
      });
    }
    setIsInputFocus(false);
  };
  useEffect(() => {
    setRenderData(getMarketCategory?.slice(0, 100 * count));
  }, [count, getMarketCategory]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="row align-items-center mt-4">
      <div className="col-md-2 col-12">
        <p className="m-0 coupang-text1">{title}</p>
      </div>
      <div className="product-label select-image col-md-10 col-12 ">
        <div className="state-selection relative selectDiv">
          <input
            ref={inputRef}
            onClick={clickInputBox}
            onChange={inputKeyword}
            value={searchKeyword[market]}
            className={`form-select option-image1 ${isInputFocus && "outline"}`}
            placeholder="검색어를 입력하세요."
          />
          {isInputFocus && (
            <div
              ref={selectBoxRef}
              className="selectBox"
              onScroll={scrollEvent}
            >
              {isLoading && (
                <div className="widthFull d-flex justify-content-center">
                  <Spinner />
                </div>
              )}
              {(renderData?.length === 0 || isError) && (
                <p className="selectBoxItem">검색결과가 없습니다.</p>
              )}
              {renderData?.map((item: any, idx: number) => (
                <button
                  onClick={selectCategory}
                  value={idx}
                  key={item.idx}
                  className="madebutton selectBoxItem widthFull"
                >
                  {market === "Coupang"
                    ? item.coupangName
                    : `${item.largeName} > ${item.middleName} > ${
                        item.smallName
                      }${
                        item.detailName !== null ? ` > ${item.detailName}` : ""
                      }`}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={clickEraseButton}
            className="madebutton selectBoxXbutton"
          >
            <XCircleIcon width={15} height={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
