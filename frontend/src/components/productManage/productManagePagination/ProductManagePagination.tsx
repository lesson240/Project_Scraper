import { UseMutationResult } from "@tanstack/react-query";
import { ProdcutManageResultItem } from "@/interface/productmanageinterface";
import { PagingButton } from "@/components/pagingButton/PagingButton";

interface Props {
  totalPage: number;
  pageNum: number;
  setPageNum: React.Dispatch<React.SetStateAction<number>>;
  getSearchResult: UseMutationResult<any, unknown, void, unknown>;
  setSelectedItem: React.Dispatch<
    React.SetStateAction<ProdcutManageResultItem[]>
  >;
}

export const ProductManagePagination = ({
  totalPage,
  pageNum,
  setPageNum,
  getSearchResult,
  setSelectedItem,
}: Props) => {
  const pageNumber: number[] = [];

  for (let i = 0; i <= totalPage; i++) {
    pageNumber.push(i);
  }

  const clickSetPage = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setSelectedItem([]);
    await setPageNum(parseInt(e.currentTarget.value));
    getSearchResult.mutate();
  };
  const clickNextPage = async () => {
    setSelectedItem([]);
    await setPageNum((prev) => prev + 1);
    getSearchResult.mutate();
  };

  const clickPrevPage = async () => {
    setSelectedItem([]);
    await setPageNum((prev) => prev - 1);
    getSearchResult.mutate();
  };

  return (
    <div className="row mt-4">
      <div className="col-12">
        <PagingButton
          currentPage={pageNum}
          totalPages={totalPage}
          onClick={clickSetPage}
          clickNextPage={clickNextPage}
          clickPrevPage={clickPrevPage}
        />
      </div>
    </div>
  );
};
