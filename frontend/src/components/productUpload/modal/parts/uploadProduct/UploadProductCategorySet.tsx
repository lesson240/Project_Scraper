import {
  Category,
  CategorySearchKeyword,
  MarketEnglish,
  MarketKorean,
} from "../../../../../interface/uploadinterface";
import { UploadCoupangCategory } from "./UploadCoupangCategory";

interface Props {
  clickCategoryAutoMapping: () => void;
  isAutoMapping: boolean;
  MARKET_SELECT: {
    id: number;
    market: string;
    title: string;
  }[];
  searchKeyword: CategorySearchKeyword;
  setSearchKeyWord: React.Dispatch<React.SetStateAction<CategorySearchKeyword>>;
  setCategory: React.Dispatch<React.SetStateAction<Category | undefined>>;
}

export const UploadProductCategorySet = ({
  setCategory,
  setSearchKeyWord,
  clickCategoryAutoMapping,
  isAutoMapping,
  MARKET_SELECT,
  searchKeyword,
}: Props) => {
  return (
    <>
      <div className="row">
        <div className="col-md-6 col-12">
          <div>
            <h6 className="function-text m-0">카테고리 선택</h6>
          </div>
        </div>
        <div className="col-md-6 col-12">
          <div className="d-flex align-items-center justify-content-end gap-3 attributes1 m-0">
            <div className="form-group">
              <input
                onChange={clickCategoryAutoMapping}
                checked={isAutoMapping}
                type="checkbox"
                id="htmlazsx"
              />
              <label htmlFor="htmlazsx"></label>
            </div>
            <p onClick={clickCategoryAutoMapping}>카테고리 오토 매핑</p>
          </div>
        </div>
      </div>
      {MARKET_SELECT.map((item) => (
        <UploadCoupangCategory
          searchKeyword={searchKeyword}
          setSearchKeyWord={setSearchKeyWord}
          market={item.market as MarketEnglish}
          key={item.id}
          title={item.title as MarketKorean}
          setCategory={setCategory}
          isAutoMapping={isAutoMapping}
        />
      ))}
    </>
  );
};
