import { SearchValue } from "@/interface/uploadinterface";

interface Props {
  inputSearchValue: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  searchValue: SearchValue;
}

export const WorkNumber = ({ inputSearchValue, searchValue }: Props) => {
  return (
    <div className="product-label col-md-2 col-12 group-pro-1">
      <label htmlFor="product-name36">수집 작업번호</label>
      <input
        type="number"
        className="form-control"
        placeholder="수집 작업번호를 입력해주세요."
        name="workNumber"
        value={
          (searchValue.workNumber as number)
            ? (searchValue.workNumber as number)
            : ""
        }
        onChange={inputSearchValue}
      />
    </div>
  );
};
