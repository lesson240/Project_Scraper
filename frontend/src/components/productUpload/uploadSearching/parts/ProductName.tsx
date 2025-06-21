import { SearchValue } from "@/interface/uploadinterface";

interface Props {
  inputSearchValue: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  searchValue: SearchValue;
}

export const ProductName = ({ searchValue, inputSearchValue }: Props) => {
  return (
    <div className="product-label col-md-2 col-12 group-pro-1">
      <label htmlFor="product-name32">상품명</label>
      <input
        type="text"
        className="form-control"
        name="productName"
        value={searchValue.productName}
        onChange={inputSearchValue}
        placeholder="상품명을 입력해주세요."
      />
    </div>
  );
};
