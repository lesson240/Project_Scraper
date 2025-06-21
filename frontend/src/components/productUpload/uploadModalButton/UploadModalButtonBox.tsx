import { UseMutationResult } from "@tanstack/react-query";

import { FourSquareIcon } from "@/components/svg/FourSquareIcon";
import {
  PriceType,
  SearchValue,
  UploadSummary,
} from "../../../interface/uploadinterface";
import { DetailPageSettingButton } from "./parts/DetailPageSettingButton";
import { PriceSettingButton } from "./parts/PriceSettingButton";
import { ProductDeleteButton } from "./parts/ProductDeleteButton";
import { ProductNameSettingButton } from "./parts/ProductNameSettingButton";
import { ProductUploadButton } from "./parts/ProductUploadButton";
import { SelectViewWayButton } from "./parts/SelectViewWayButton";
import { TagSettingButton } from "./parts/TagSettingButton";
import { useState } from "react";

interface Props {
  collectProductSummary: UseMutationResult<any, unknown, void, unknown>;
  searchValue: SearchValue;
  setSearchValue: React.Dispatch<React.SetStateAction<SearchValue>>;
  selectedItem: UploadSummary[];
  setIsViewWayDetail: React.Dispatch<React.SetStateAction<boolean>>;
  isViewWayDetail: boolean;
  setSelectedItem: React.Dispatch<React.SetStateAction<UploadSummary[]>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

export const UploadModalButtonBox = ({
  isViewWayDetail,
  setIsViewWayDetail,
  selectedItem,
  collectProductSummary,
  searchValue,
  setSearchValue,
  setSelectedItem,
  setPage,
}: Props) => {
  const selectPerPage = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await setSearchValue({
      ...searchValue,
      pageLimit: parseInt(e.target.value),
      pageNum: 1,
    });
    await setPage(1);
    collectProductSummary.mutate();
  };

  return (
    <div className="row buttonBoxSticky">
      <div className="col-12">
        <div className="total-block">
          <div className="total-block-inner">
            {collectProductSummary?.data?.summary.length && (
              <h4>
                검색 {collectProductSummary?.data?.summary.length}개
                <span className="text14">
                  (전체 {collectProductSummary?.data?.totalCount}개)
                </span>
              </h4>
            )}
          </div>
          <div className="d-flex align-items-center gap-2">
            <PriceSettingButton
              selectedItem={selectedItem}
              collectProductSummary={collectProductSummary}
              setSelectedItem={setSelectedItem}
            />
            <TagSettingButton
              selectedItem={selectedItem}
              collectProductSummary={collectProductSummary}
              setSelectedItem={setSelectedItem}
            />
            <DetailPageSettingButton selectedItem={selectedItem} />
            <ProductNameSettingButton
              collectProductSummary={collectProductSummary}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
            />
            <ProductUploadButton selectedItem={selectedItem} />
            <ProductDeleteButton
              setSelectedItem={setSelectedItem}
              selectedItem={selectedItem}
              collectProductSummary={collectProductSummary}
            />
            <SelectViewWayButton
              isViewWayDetail={isViewWayDetail}
              setIsViewWayDetail={setIsViewWayDetail}
            />
            <div className="state-selection total-select">
              <FourSquareIcon />
              <select
                onChange={selectPerPage}
                className="form-select"
                value={searchValue.pageLimit}
              >
                <option value="30">30개</option>
                <option value="50">50개</option>
                <option value="100">100개</option>
                <option value="300">300개</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
