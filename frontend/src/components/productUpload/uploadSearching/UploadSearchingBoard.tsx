import useToggle from "@/hooks/useToggle";
import { SearchValue } from "@/interface/uploadinterface";
import { changePeriodTimeFormat } from "@/utils/functions/changePeriodTimeFormat";
import { useEffect, useState } from "react";
import { UseMutationResult } from "@tanstack/react-query";
import { ProductGroup } from "./parts/ProductGroup";
import { ProductName } from "./parts/ProductName";
import { Memo } from "./parts/Memo";
import { NonUploadAccout } from "./parts/NonUploadAccount";
import { UploadWorkNumber } from "./parts/UploadWorkNumber";
import { WorkNumber } from "./parts/WorkNumber";
import { ProductCode } from "./parts/ProductCode";
import { ProductSearchingValue } from "./parts/ProductSearchingValue";
import { ResetButton } from "@/components/productManage/productManageSearchingBoard/parts/button/ResetButton";
import { PeriodSettingButton } from "@/components/productManage/productManageSearchingBoard/parts/button/PeriodSettingButton";
import { SearchingButton } from "@/components/productManage/productManageSearchingBoard/parts/button/SearchingButton";
import { SearchingBoardPeriodComponent } from "@/components/productManage/productManageSearchingBoard/parts/SearcingBoardPeriodComponent";

interface Props {
  collectProductSummary: UseMutationResult<any, unknown, void, unknown>;
  searchValue: SearchValue;
  setSearchValue: React.Dispatch<React.SetStateAction<SearchValue>>;
  defaultSearch: SearchValue;
  clickSearch: () => void;
}

export const UploadSearchingBoard = ({
  defaultSearch,
  collectProductSummary,
  searchValue,
  setSearchValue,
  clickSearch,
}: Props) => {
  const { state: isPeriodBar, handleToggle: handlePeriodBar } =
    useToggle(false);
  const [date, setDate] = useState(changePeriodTimeFormat("aMonth"));
  const inputSearchValue = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "workNumber" || name === "uploadWorkNumber") {
      setSearchValue({
        ...searchValue,
        [name]: value !== "" ? parseInt(value) : null,
      });
    } else {
      setSearchValue({
        ...searchValue,
        [name]: value,
      });
    }
  };
  useEffect(() => {
    setSearchValue({
      ...searchValue,
      startDate: date.startDate,
      endDate: date.endDate,
    });
  }, [date]);
  const selectNonUploadMarketAccount = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const splitAccount = e.target.value.split(">>");
    setSearchValue({
      ...searchValue,
      nonUpload: {
        market: splitAccount[0],
        marketAccount: splitAccount[1],
      },
    });
  };
  const clickReset = () => {
    setSearchValue(defaultSearch);
  };
  return (
    <div className="row mt-5">
      <div className="col-12">
        <div className="first-product-tab">
          <div className="row">
            <ProductGroup
              searchValue={searchValue}
              inputSearchValue={inputSearchValue}
            />
            <ProductName
              searchValue={searchValue}
              inputSearchValue={inputSearchValue}
            />
            <Memo
              searchValue={searchValue}
              inputSearchValue={inputSearchValue}
              setSearchValue={setSearchValue}
            />
            <NonUploadAccout
              searchValue={searchValue}
              selectNonUploadMarketAccount={selectNonUploadMarketAccount}
            />
          </div>
          <div className="row mt-3">
            <UploadWorkNumber
              searchValue={searchValue}
              inputSearchValue={inputSearchValue}
            />
            <WorkNumber
              searchValue={searchValue}
              inputSearchValue={inputSearchValue}
            />
            <ProductCode
              searchValue={searchValue}
              inputSearchValue={inputSearchValue}
            />
          </div>
          <ProductSearchingValue
            searchValue={searchValue}
            setSearchValue={setSearchValue}
          />
          <div className="row pt-4 pb-2 align-items-center">
            <div className="col-md-7 col-12">
              <div className="group-name d-flex align-items-center gap-2"></div>
            </div>
            <div className="col-md-5 col-12">
              <div className="search-btn d-flex justify-content-end gap-2 align-items-center">
                <ResetButton onClick={clickReset} />
                <PeriodSettingButton
                  checked={isPeriodBar}
                  handlePeriodBar={handlePeriodBar}
                />
                <SearchingButton onClick={clickSearch} />
              </div>
            </div>
          </div>
          {isPeriodBar && (
            <SearchingBoardPeriodComponent date={date} setDate={setDate} />
          )}
        </div>
      </div>
    </div>
  );
};
