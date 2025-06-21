import { useState } from "react";
import { UploadProductCategorySet } from "./component/uploadproduct/UploadProductCategorySet";
import { UploadCategorySetButton } from "./component/uploadproduct/UploadCategorySetButton";
import { UploadMarketSelectSubtitle } from "./component/uploadproduct/UploadMarketSelectSubtitle";
import { UploadButtonBox } from "./component/uploadproduct/UploadButtonBox";
import { UploadSelectCoupangAccount } from "./component/uploadproduct/UploadSelectCoupangAccount";
import { UploadSelectSmartStoreAccount } from "./component/uploadproduct/UploadSelectSmartStoreAccount";
import { UploadSelectAuctionAccount } from "./component/uploadproduct/UploadSelectAuctionAccount";
import { UploadSelectGmarketAccount } from "./component/uploadproduct/UploadSelectGmarketAccount";
import { UploadSelectElevenstAccount } from "./component/uploadproduct/UploadSelectElevenstAccount";
import {
  ApplyCategory,
  Category,
  CategorySearchKeyword,
  UploadSummary,
} from "@/interface/uploadinterface";
import { upload } from "@/utils/functions/postApi";
import { ModalBg } from "@/components/ModalLayout/ModalBg";
import { ModalInnerTop } from "@/components/ModalLayout/ModalInnerTop";
import ModalContent from "@/components/shared/modal/ModalContent";

interface Props {
  selectedItem: UploadSummary[];
}

export const ProductUploadModal = ({ selectedItem }: Props) => {
  const [isAutoMapping, setIsAutoMapping] = useState<boolean>(true);
  const [storeName, setStoreName] =
    useState<CategorySearchKeyword>(SEARCH_DEFAULT);
  const [searchKeyword, setSearchKeyWord] =
    useState<CategorySearchKeyword>(SEARCH_DEFAULT);
  const [applyCategory, setApplyCategory] =
    useState<ApplyCategory>(SEARCH_DEFAULT2);
  const [category, setCategory] = useState<Category>();
  const [isSetCategory, setIsSetCategory] = useState<boolean>(false);

  const clickCategoryAutoMapping = () => {
    setIsAutoMapping((prev) => !prev);
    clickReset();
  };

  const clickReset = () => {
    setIsSetCategory(false);
    setSearchKeyWord(SEARCH_DEFAULT);
    setApplyCategory(SEARCH_DEFAULT2);
    setCategory(CATEGORY_DEFAULT);
  };

  const clickCategorySave = async () => {
    const res = await upload.searchCategoryMapping({
      coupangId: category?.Coupang ? category?.Coupang!.idx : undefined,
      auction: category?.Auction ? category?.Auction!.id : undefined,
      gmarket: category?.Gmarket ? category?.Gmarket?.id : undefined,
      elevenst: category?.Elevenst ? category?.Elevenst?.id : undefined,
      smartstore: category?.SmartStore ? category?.SmartStore?.id : undefined,
    });
    setApplyCategory(res as any);
    if (res) {
      setIsSetCategory(true);
    }
  };

  return (
    <ModalContent>
      <ModalContent.ModalHead>
        <h5
          className="modal-title d-flex align-items-center"
          id="exampleModalLabel"
        >
          판매 등록{" "}
          <span className="three-selected">
            선택상품 {selectedItem?.length}개
          </span>
        </h5>
      </ModalContent.ModalHead>

      <ModalContent.ModalBody>
        <UploadProductCategorySet
          clickCategoryAutoMapping={clickCategoryAutoMapping}
          isAutoMapping={isAutoMapping}
          MARKET_SELECT={MARKET_SELECT}
          searchKeyword={searchKeyword}
          setSearchKeyWord={setSearchKeyWord}
          setCategory={setCategory}
        />
        <UploadCategorySetButton
          clickReset={clickReset}
          clickCategorySave={clickCategorySave}
        />
        {isSetCategory && (
          <>
            <UploadMarketSelectSubtitle />
            <UploadSelectCoupangAccount
              isAutoMapping={isAutoMapping}
              applyCategory={applyCategory}
              setStoreName={setStoreName}
            />
            <UploadSelectSmartStoreAccount
              isAutoMapping={isAutoMapping}
              applyCategory={applyCategory}
              setStoreName={setStoreName}
            />
            <UploadSelectAuctionAccount
              isAutoMapping={isAutoMapping}
              applyCategory={applyCategory}
              setStoreName={setStoreName}
            />
            <UploadSelectGmarketAccount
              isAutoMapping={isAutoMapping}
              applyCategory={applyCategory}
              setStoreName={setStoreName}
            />
            <UploadSelectElevenstAccount
              isAutoMapping={isAutoMapping}
              applyCategory={applyCategory}
              setStoreName={setStoreName}
            />
            <UploadButtonBox
              isAutoMapping={isAutoMapping}
              storeName={storeName}
              selectedItem={selectedItem}
              applyCategory={applyCategory}
            />
          </>
        )}
      </ModalContent.ModalBody>
    </ModalContent>
  );
};

const MARKET_SELECT = [
  {
    id: 0,
    market: "Coupang",
    title: "쿠팡",
  },
  {
    id: 1,
    market: "SmartStore",
    title: "스마트스토어",
  },
  {
    id: 2,
    market: "Auction",
    title: "옥션",
  },
  {
    id: 3,
    market: "Gmarket",
    title: "지마켓",
  },
  {
    id: 4,
    market: "Elevenst",
    title: "11번가 글로벌",
  },
];

const SEARCH_DEFAULT = {
  Coupang: "",
  Auction: "",
  Gmarket: "",
  Elevenst: "",
  SmartStore: "",
};

const SEARCH_DEFAULT2 = {
  coupang: "",
  auction: "",
  gmarket: "",
  elevenst: "",
  smartStore: "",
};
const CATEGORY_DEFAULT = {
  Coupang: null,
  Auction: null,
  Elevenst: null,
  SmartStore: null,
  Gmarket: null,
};
