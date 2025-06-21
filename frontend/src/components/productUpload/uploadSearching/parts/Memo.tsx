import { DownArrowIcon } from "@/components/svg/DownArrowIcon";
import useToggle from "@/hooks/useToggle";
import { SearchValue } from "@/interface/uploadinterface";
import { MemoSelect } from "@/components/Collect/MemoSelect/MemoSelect";

interface Props {
  inputSearchValue: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  searchValue: SearchValue;
  setSearchValue: React.Dispatch<React.SetStateAction<SearchValue>>;
}

export const Memo = ({
  inputSearchValue,
  searchValue,
  setSearchValue,
}: Props) => {
  const { state: isSelect, handleToggle: handleSelect } = useToggle();
  return (
    <div className="product-label col-md-2 col-12 group-pro-1">
      <label htmlFor="product-name33">상품 메모</label>
      <div className="relative">
        <input
          type="text"
          className="form-control"
          name="memo"
          onChange={inputSearchValue}
          value={searchValue.memo}
          placeholder="메모를 입력해주세요."
        />
        <button
          className="madebutton collect-group-select-btn"
          onClick={handleSelect}
        >
          <DownArrowIcon />
        </button>
        {isSelect && (
          <MemoSelect
            setCollectValue={setSearchValue}
            closeModal={handleSelect}
          />
        )}
      </div>
    </div>
  );
};
