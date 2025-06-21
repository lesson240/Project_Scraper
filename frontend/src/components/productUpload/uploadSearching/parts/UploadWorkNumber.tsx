import { SearchValue } from "@/interface/uploadinterface";

interface Props {
  inputSearchValue: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  searchValue: SearchValue;
}
export const UploadWorkNumber = ({ inputSearchValue, searchValue }: Props) => {
  return (
    <div className="product-label col-md-2 col-12 group-pro-1">
      <label>업로드 작업번호</label>
      <input
        type="number"
        className="form-control"
        placeholder="업로드 작업번호를 입력해주세요."
        name="uploadWorkNumber"
        value={
          (searchValue?.uploadWorkNumber as number)
            ? (searchValue?.uploadWorkNumber as number)
            : ""
        }
        onChange={inputSearchValue}
      />
    </div>
  );
};
