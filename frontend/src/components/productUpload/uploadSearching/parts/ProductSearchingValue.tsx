import { EraseIcon } from "@/components/svg/EraseIcon";
import { SearchValue } from "@/interface/uploadinterface";

interface Props {
  searchValue: SearchValue;
  setSearchValue: React.Dispatch<React.SetStateAction<SearchValue>>;
}

export const ProductSearchingValue = ({
  searchValue,
  setSearchValue,
}: Props) => {
  const clickErase = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { name } = e.currentTarget;
    if (name === "nonUpload") {
      setSearchValue((prev) => {
        return {
          ...prev,
          nonUpload: {
            market: "",
            marketAccount: "",
          },
        };
      });
    } else {
      setSearchValue((prev) => {
        return {
          ...prev,
          [name]: "",
        };
      });
    }
  };

  return (
    <div className="d-flex mt-3">
      {searchValue.groupName !== "" && (
        <h6 className="d-flex align-items-center gap-1">
          상품 그룹 : {searchValue.groupName}
          <button onClick={clickErase} name="groupName" className="madebutton">
            <EraseIcon />
          </button>
        </h6>
      )}
      {searchValue.productName !== "" && (
        <h6 className="d-flex align-items-center gap-1">
          상품명 : {searchValue.productName}
          <button
            onClick={clickErase}
            name="productName"
            className="madebutton"
          >
            <EraseIcon />
          </button>
        </h6>
      )}
      {searchValue.memo !== "" && (
        <h6 className="d-flex align-items-center gap-1">
          상품 메모 : {searchValue.memo}
          <button onClick={clickErase} name="memo" className="madebutton">
            <EraseIcon />
          </button>
        </h6>
      )}
      {searchValue.nonUpload.marketAccount !== "" && (
        <h6 className="d-flex align-items-center gap-1">
          미업로드 마켓 : {searchValue.nonUpload.market}_
          {searchValue.nonUpload.marketAccount}
          <button onClick={clickErase} name="nonUpload" className="madebutton">
            <EraseIcon />
          </button>
        </h6>
      )}
      {searchValue.uploadWorkNumber && (
        <h6 className="d-flex align-items-center gap-1">
          업로드 작업번호 : {searchValue.uploadWorkNumber}
          <button
            onClick={clickErase}
            name="uploadWorkNumber"
            className="madebutton"
          >
            <EraseIcon />
          </button>
        </h6>
      )}
      {searchValue.workNumber && (
        <h6 className="d-flex align-items-center gap-1">
          수집 작업번호 : {searchValue.workNumber}
          <button onClick={clickErase} name="workNumber" className="madebutton">
            <EraseIcon />
          </button>
        </h6>
      )}
      {searchValue.code !== "" && (
        <h6 className="d-flex align-items-center gap-1">
          상품코드 : {searchValue.code}
          <button onClick={clickErase} name="code" className="madebutton">
            <EraseIcon />
          </button>
        </h6>
      )}
    </div>
  );
};
