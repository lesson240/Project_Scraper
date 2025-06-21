import { LeftIcon } from "../svg/LeftIcon";
import { RightIcon } from "../svg/RightIcon";

interface Props {
  currentPage: number;
  totalPages: number;
  onClick:
    | ((e: React.MouseEvent<HTMLButtonElement>) => Promise<void>)
    | ((e: React.MouseEvent<HTMLButtonElement>) => void);
  clickNextPage: (() => Promise<void>) | (() => void);
  clickPrevPage: (() => Promise<void>) | (() => void);
  disabled?: boolean;
}

export const PagingButton = ({
  currentPage,
  totalPages,
  onClick,
  clickNextPage,
  clickPrevPage,
  disabled = false,
}: Props) => {
  const pageButtons = [];
  if (currentPage >= 8) {
    if (currentPage >= totalPages - 3) {
      pageButtons.push(
        <button
          key={1}
          value={1}
          className={1 === currentPage ? "nowPage madebutton" : "madebutton"}
          onClick={onClick}
          disabled={1 === currentPage || disabled}
        >
          {1}
        </button>
      );
      pageButtons.push(<span key="ellipsis-start">...</span>);
      for (let i = currentPage - 3; i <= totalPages; i++) {
        if (i > 1 && i <= totalPages) {
          pageButtons.push(
            <button
              value={i}
              key={i}
              disabled={i === currentPage || disabled}
              className={
                i === currentPage ? "nowPage madebutton" : "madebutton"
              }
              onClick={onClick}
            >
              {i}
            </button>
          );
        }
      }
    } else {
      pageButtons.push(
        <button
          key={1}
          value={1}
          className={1 === currentPage ? "nowPage madebutton" : "madebutton"}
          onClick={onClick}
          disabled={1 === currentPage || disabled}
        >
          {1}
        </button>
      );
      pageButtons.push(<span key="ellipsis-start">...</span>);
      for (let i = currentPage - 3; i <= currentPage + 3; i++) {
        if (i > 1 && i < totalPages) {
          pageButtons.push(
            <button
              value={i}
              key={i}
              disabled={i === currentPage || disabled}
              className={
                i === currentPage ? "nowPage madebutton" : "madebutton"
              }
              onClick={onClick}
            >
              {i}
            </button>
          );
        }
      }
      pageButtons.push(<span key="ellipsis-end">...</span>);
      pageButtons.push(
        <button
          value={totalPages}
          key={totalPages}
          disabled={totalPages === currentPage || disabled}
          className={
            totalPages === currentPage ? "nowPage madebutton" : "madebutton"
          }
          onClick={onClick}
        >
          {totalPages}
        </button>
      );
    }
  } else {
    for (let i = 1; i <= Math.min(8, totalPages); i++) {
      pageButtons.push(
        <button
          value={i}
          key={i}
          disabled={currentPage === i || disabled}
          className={`madebutton ${currentPage === i && `nowPage`}`}
          onClick={onClick}
        >
          {i}
        </button>
      );
    }
    if (totalPages > 8) {
      pageButtons.push(<span key="ellipsis">...</span>);
    }
  }

  return (
    <div className="pagination-nav">
      <div className="d-flex align-items-center gap-4 justify-content-center pagination-nav-ul">
        <button
          className={`madebutton ${1 === currentPage && "disabled"}`}
          disabled={1 === currentPage || disabled}
          onClick={clickPrevPage}
        >
          <LeftIcon />
        </button>
        {pageButtons}
        <button
          className={`madebutton ${totalPages === currentPage && "disabled"}`}
          onClick={clickNextPage}
          disabled={totalPages === currentPage || disabled}
        >
          <RightIcon />
        </button>
      </div>
    </div>
  );
};
