import { Category } from "../../../../../interface/uploadinterface";

interface Props {}

export const UploadCompleteCheckAccount = () => {
  return (
    <div className="col-md-2 col-12">
      <div className="d-flex justify-content-center radio-free-col-2 pb-0 complete1">
        <div className="radio-free-inner">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              name="flexRadioDefault"
              id="flexRadioDefault12x"
              checked
              readOnly
            />
            <label className="form-check-label" htmlFor="flexRadioDefault12x">
              완료
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
