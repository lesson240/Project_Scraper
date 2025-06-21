import { SearchValue } from "@/interface/uploadinterface";

interface Props {
  inputSearchValue: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  searchValue: SearchValue;
}

export const ProductCode = ({ searchValue, inputSearchValue }: Props) => {
  return (
    <div className="product-label product-label-1 col-md-8 col-12 group-pro-3">
      <label>상품코드</label>
      <input
        type="text"
        className="form-control"
        placeholder="쉼표(,)로 구분하여 코드 복수 입력이 가능합니다."
        name="code"
        value={searchValue.code}
        onChange={inputSearchValue}
      />
    </div>
  );
};
