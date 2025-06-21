import { useState } from "react";
import { UseMutationResult } from "@tanstack/react-query";
import { PeriodSettingButton } from "./parts/button/PeriodSettingButton";
import { ResetButton } from "./parts/button/ResetButton";
import { SearchingButton } from "./parts/button/SearchingButton";
import { SearchingBoardAccountSelect } from "./parts/SearchingBoardAccountSelect";
import { SearchingBoardInputBox } from "./parts/SearchingBoardInputBox";
import {
  MarketAccount,
  ProdcutManageResultItem,
  ProductManageSearchingValue,
} from "@/interface/productmanageinterface";
import { useAlert } from "@/hooks/useAlert";
import useToggle from "@/hooks/useToggle";
import { SearchingBoardValueList } from "./parts/SearchingBoardValueList";
import { AlertOnlyClose } from "@/components/alert/AlertOnlyClose";
import { SearchingBoardPeriodComponent } from "./parts/SearcingBoardPeriodComponent";
import { useInfoWindow } from "@/hooks/useInfoWindow";

interface Props {
  marketAccountValue: MarketAccount | undefined;
  setMarketAccountValue: React.Dispatch<
    React.SetStateAction<MarketAccount | undefined>
  >;
  searchingValue: ProductManageSearchingValue;
  setSearchingValue: React.Dispatch<
    React.SetStateAction<{
      pageLimit: number;
      code: string;
      productName: string;
      memo: string;
      groupName: string;
      uploadWorkNumber: string;
      sort: boolean;
    }>
  >;
  getSearchResult: UseMutationResult<any, unknown, void, unknown>;
  setDate: React.Dispatch<
    React.SetStateAction<{
      startDate: string;
      endDate: string;
    }>
  >;
  date: {
    startDate: string;
    endDate: string;
  };
  setPageNum: React.Dispatch<React.SetStateAction<number>>;
  setSelectedItem: React.Dispatch<
    React.SetStateAction<ProdcutManageResultItem[]>
  >;
  setSelectedMarket: React.Dispatch<
    React.SetStateAction<MarketAccount | undefined>
  >;
  setViewConditionValue: React.Dispatch<
    React.SetStateAction<{
      isView: boolean;
      viewValue: {
        filter: string;
        count: number;
      };
    }>
  >;
  viewConditionValue: {
    isView: boolean;
    viewValue: {
      filter: string;
      count: number;
    };
  };
  selectedMarket: MarketAccount | undefined;
}

export const ProductManageSearchingBoard = ({
  selectedMarket,
  setSelectedMarket,
  marketAccountValue,
  setMarketAccountValue,
  searchingValue,
  setSearchingValue,
  getSearchResult,
  setDate,
  date,
  setPageNum,
  setSelectedItem,
  viewConditionValue,
  setViewConditionValue,
}: Props) => {
  const { state: isPeriodBar, handleToggle: handlePeriodBar } = useToggle(true);
  const { isAlert, handleAlert, alertMessage } = useAlert();
  const openWindow = useInfoWindow();

  const clickSearch = async () => {
    if (marketAccountValue?.account && marketAccountValue?.market) {
      setSelectedItem([]);
      await setPageNum(1);
      getSearchResult.mutate();
      setSelectedMarket({
        market: marketAccountValue?.market!,
        account: marketAccountValue?.account!,
      });
    } else if (!marketAccountValue?.account && marketAccountValue?.market) {
      openWindow("계정을 선택해 주세요.\n선택된 계정이 없습니다.");
    } else {
      openWindow("마켓을 선택해 주세요.\n선택된 마켓이 없습니다.");
    }
  };

  const resetSearchingValue = () => {
    setSearchingValue({
      pageLimit: 30,
      code: "",
      productName: "",
      memo: "",
      groupName: "",
      uploadWorkNumber: "",
      sort: true,
    });
  };

  return (
    <div className="row mt-5">
      <div className="col-12">
        <div className="first-product-tab">
          <SearchingBoardAccountSelect
            marketAccountValue={marketAccountValue}
            setMarketAccountValue={setMarketAccountValue}
          />
          <SearchingBoardInputBox
            searchingValue={searchingValue}
            setSearchingValue={setSearchingValue}
          />
          <div className="row pt-4 pb-2 align-items-center">
            <SearchingBoardValueList
              searchingValue={searchingValue}
              setSearchingValue={setSearchingValue}
            />
            <div className="col-md-5 col-12">
              <div className="search-btn d-flex justify-content-end gap-2 align-items-center">
                <ResetButton onClick={resetSearchingValue} />
                <PeriodSettingButton
                  checked={isPeriodBar}
                  handlePeriodBar={handlePeriodBar}
                />
                <SearchingButton onClick={clickSearch} />
              </div>
            </div>
          </div>
          {isPeriodBar && (
            <SearchingBoardPeriodComponent
              date={date}
              setDate={setDate}
              setViewConditionValue={setViewConditionValue}
              viewConditionValue={viewConditionValue}
            />
          )}
          {isAlert && (
            <AlertOnlyClose
              message={alertMessage}
              closeAlert={handleAlert as () => {}}
            />
          )}
        </div>
      </div>
    </div>
  );
};
