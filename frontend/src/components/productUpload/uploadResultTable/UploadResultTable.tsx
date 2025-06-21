import { UseMutationResult } from "react-query";
import { UploadResultItem } from "./UploadResultItem";
import { UploadSummary } from "@/interface/uploadinterface";
import { Spinner } from "@/components/Spinner/Spinner";
import { UploadNoneResult } from "./UploadNoneResult";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface Props {
  collectProductSummary: UseMutationResult<any, unknown, void, unknown>;
  setSelectedItem: React.Dispatch<React.SetStateAction<UploadSummary[]>>;
  selectedItem: UploadSummary[];
  isViewWayDetail: boolean;
  page: number;
}

export const UploadResultTable = ({
  isViewWayDetail,
  collectProductSummary,
  selectedItem,
  setSelectedItem,
  page,
}: Props) => {
  const clickAllSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItem(collectProductSummary?.data?.summary);
    } else {
      setSelectedItem([]);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  const handleScroll = () => {
    window.scrollY > 100 &&
      localStorage.setItem("scrollPosition", `${window.scrollY}`);
  };

  return (
    <div className="row total-table-col collect-market">
      <div className="col-12">
        <div className="heading-two heading-three heading-five heading-five2">
          <table
            width="100%"
            cellPadding="0"
            cellSpacing="0"
            border={0}
            align="center"
          >
            <thead className="head-one">
              <tr className="stickyHeader">
                <th>
                  <div className="form-group">
                    <input
                      onChange={clickAllSelect}
                      type="checkbox"
                      id="htmla"
                      checked={
                        selectedItem?.length !== 0 &&
                        selectedItem?.length ===
                          collectProductSummary?.data?.summary?.length
                      }
                      readOnly
                    />
                    <label htmlFor="htmla"></label>
                  </div>
                </th>
                <th className="oneLine">수집 마켓</th>
                <th className="oneLine">상품정보</th>
                <th className="oneLine">기능</th>
                <th className="oneLine">상세정보</th>
              </tr>
            </thead>
            <tbody className="body-one">
              {collectProductSummary?.data?.isLoading && (
                <tr className="">
                  <td colSpan={5}>
                    <div className="mt-5 pt-5">
                      <Spinner />
                    </div>
                  </td>
                </tr>
              )}
              {collectProductSummary?.data?.summary?.map(
                (item: UploadSummary) => (
                  <UploadResultItem
                    collectProductSummary={collectProductSummary}
                    isViewWayDetail={isViewWayDetail}
                    key={item.id}
                    item={item}
                    setSelectedItem={setSelectedItem}
                    selectedItem={selectedItem}
                    page={page}
                  />
                )
              )}
              {(!collectProductSummary ||
                collectProductSummary?.data?.summary?.length === 0) &&
                !collectProductSummary.data?.isLoading && (
                  <UploadNoneResult colSpan={5} />
                )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
