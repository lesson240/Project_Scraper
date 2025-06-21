import { ResetIcon } from "@/components/svg/ResetIcon";

interface Props {
  clickReset: () => void;
  clickCategorySave: () => Promise<void>;
}

export const UploadCategorySetButton = ({
  clickReset,
  clickCategorySave,
}: Props) => {
  return (
    <div className="row mt-3">
      <div className="col-12">
        <div className="d-flex align-items-center justify-content-center gap-3 mt-4">
          <button onClick={clickReset} className="cancel-btn">
            <ResetIcon />
            초기화
          </button>
          <button onClick={clickCategorySave} className="cancel-btn save-btn">
            저장
          </button>
        </div>
      </div>
    </div>
  );
};
