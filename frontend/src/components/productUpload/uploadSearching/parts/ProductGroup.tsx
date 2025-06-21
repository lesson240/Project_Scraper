import { QuestionButton } from "@/components/Button/QuestionButton";
import useFetch from "@/hooks/useFetch";
import { SearchValue } from "@/interface/uploadinterface";

interface Props {
  inputSearchValue: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  searchValue: SearchValue;
}

export const ProductGroup = ({ inputSearchValue, searchValue }: Props) => {
  const [productGroupList] = useFetch(
    "productGroup",
    "/Product/GetProductGroupNames"
  );
  return (
    <div className="product-label select-image col-md-2 col-12 group-pro-1">
      {/* <div className="d-flex gap-2"> */}
      <label className="">상품 그룹</label>
      {/* <div>
          <QuestionButton />
        </div> */}
      {/* </div> */}
      <div className="state-selection">
        <select
          value={searchValue.groupName}
          name="groupName"
          className="form-select"
          onChange={inputSearchValue}
        >
          <option value="">상품 그룹명을 선택해주세요</option>
          {productGroupList?.map((item: string, idx: number) => (
            <option value={item} key={idx}>
              {item}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
