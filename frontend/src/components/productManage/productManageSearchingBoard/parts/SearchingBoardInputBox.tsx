import useFetch from "@/hooks/useFetch";
import { ProductManageSearchingValue } from "@/interface/productmanageinterface";
import { InputBoxMemo } from "./InputBox/InputBoxMemo";
import { InputBoxProductCode } from "./InputBox/InputBoxProductCode";
import { InputBoxProductName } from "./InputBox/InputBoxProductName";
import { InputBoxUploadWorkingNumber } from "./InputBox/InputBoxUploadWorkingNumber";

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

export const SearchingBoardInputBox = ({
  setSearchingValue,
  searchingValue,
}: Props) => {
  const [productGroupList] = useFetch(
    "productGroup",
    "/Product/GetProductGroupNames"
  );

  const inputSearchingValue = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSearchingValue({
      ...(searchingValue as any),
      [name]: value,
    });
  };

  return (
    <div className="row mt-3">
      <div className="product-label select-image col-md-3 col-12 width-devide-1">
        <label htmlFor="product-name3111">상품 그룹</label>
        <select
          onChange={inputSearchingValue}
          defaultValue=""
          id="product-name3111"
          className="form-select"
          aria-label="Default select example"
          name="groupName"
        >
          <option value="">상품그룹을 선택해주세요</option>
          {Array.isArray(productGroupList) &&
            productGroupList.map((item) => (
              <option value={item} key={item}>
                {item}
              </option>
            ))}
        </select>
      </div>
      <InputBoxProductName
        onChange={inputSearchingValue}
        value={searchingValue}
      />
      <InputBoxMemo onChange={inputSearchingValue} value={searchingValue} />
      <InputBoxUploadWorkingNumber
        onChange={inputSearchingValue}
        value={searchingValue}
      />
      <InputBoxProductCode
        onChange={inputSearchingValue}
        value={searchingValue}
      />
    </div>
  );
};
