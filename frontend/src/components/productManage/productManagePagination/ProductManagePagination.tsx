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

// 예시, 실제로는 컴포넌트 소스에 맞게 조정
export function ProductManagePagination({
  totalPages,
  currentPage,
  onClick,
  clickNextPage,
  clickPrevPage
}: any) {
  // 아주 단순한 페이징 버튼들
  return (
      <div style={{display: "flex", justifyContent: "center", gap: 16, marginTop: 40}}>
          <button onClick={clickPrevPage}>이전</button>
          <span>{currentPage} / {totalPages}</span>
          <button onClick={clickNextPage}>다음</button>
          {/* 예시용 페이지 선택 */}
          {[...Array(totalPages)].map((_, idx) => (
              <button key={idx} value={idx+1} onClick={onClick}>
                  {idx+1}
              </button>
          ))}
      </div>
  );
}



// export const ProductManagePagination = ({
//   totalPage,
//   pageNum,
//   setPageNum,
//   getSearchResult,
//   setSelectedItem,
// }: Props) => {
//   const pageNumber: number[] = [];

//   for (let i = 0; i <= totalPage; i++) {
//     pageNumber.push(i);
//   }

//   const clickSetPage = async (e: React.MouseEvent<HTMLButtonElement>) => {
//     setSelectedItem([]);
//     await setPageNum(parseInt(e.currentTarget.value));
//     getSearchResult.mutate();
//   };
//   const clickNextPage = async () => {
//     setSelectedItem([]);
//     await setPageNum((prev) => prev + 1);
//     getSearchResult.mutate();
//   };

//   const clickPrevPage = async () => {
//     setSelectedItem([]);
//     await setPageNum((prev) => prev - 1);
//     getSearchResult.mutate();
//   };

//   return (
//     <div className="row mt-4">
//       <div className="col-12">
//         <PagingButton
//           currentPage={pageNum}
//           totalPages={totalPage}
//           onClick={clickSetPage}
//           clickNextPage={clickNextPage}
//           clickPrevPage={clickPrevPage}
//         />
//       </div>
//     </div>
//   );
// };
