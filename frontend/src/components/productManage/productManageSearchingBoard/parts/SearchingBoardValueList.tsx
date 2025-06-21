import { EraseIcon } from "@/components/svg/EraseIcon";
import { ProductManageSearchingValue } from "@/interface/productmanageinterface";

interface Props {
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
}

export const SearchingBoardValueList = ({
  searchingValue,
  setSearchingValue,
}: Props) => {
  const erase = (e: React.MouseEvent<HTMLButtonElement>) => {
    setSearchingValue({
      ...searchingValue,
      [e.currentTarget.name]: "",
    } as any);
  };

  return (
    <div className="col-md-7 col-12">
      <div className="group-name d-flex align-items-center gap-2">
        {searchingValue.groupName !== "" && (
          <>
            <h6 className="d-flex align-items-center gap-1">
              상품 그룹 : {searchingValue.groupName}
              <button name="groupName" className="madebutton" onClick={erase}>
                <EraseIcon />
              </button>
            </h6>
          </>
        )}
        {searchingValue.productName !== "" && (
          <>
            <h6 className="d-flex align-items-center gap-1">
              상품 명 : {searchingValue.productName}
              <button name="productName" className="madebutton" onClick={erase}>
                <EraseIcon />
              </button>
            </h6>
          </>
        )}
        {searchingValue.memo !== "" && (
          <>
            <h6 className="d-flex align-items-center gap-1">
              메모 : {searchingValue.memo}
              <button name="memo" className="madebutton" onClick={erase}>
                <EraseIcon />
              </button>
            </h6>
          </>
        )}
        {searchingValue.uploadWorkNumber.toString() !== "" && (
          <>
            <h6 className="d-flex align-items-center gap-1">
              작업번호 : {searchingValue.uploadWorkNumber}
              <button
                name="uploadWorkNumber"
                className="madebutton"
                onClick={erase}
              >
                <EraseIcon />
              </button>
            </h6>
          </>
        )}
        {searchingValue.code !== "" && (
          <>
            <h6 className="d-flex align-items-center gap-1">
              상품코드 : {searchingValue.code}
              <button name="code" className="madebutton" onClick={erase}>
                <EraseIcon />
              </button>
            </h6>
          </>
        )}
      </div>
    </div>
  );
};
