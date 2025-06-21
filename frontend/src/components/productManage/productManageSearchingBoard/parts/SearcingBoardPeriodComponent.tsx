import { CalendarIcon } from "@/components/svg/CalendarIcon";
import { changePeriodTimeFormat } from "@/utils/functions/changePeriodTimeFormat";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { productManagePeriod } from "@/atom/atom";

interface Props {
  setDate: React.Dispatch<
    React.SetStateAction<{
      startDate: string;
      endDate: string;
    }>
  >;
  date: {
    startDate: string;
    endDate: string;
  };
  setViewConditionValue?: React.Dispatch<
    React.SetStateAction<{
      isView: boolean;
      viewValue: {
        filter: string;
        count: number;
      };
    }>
  >;
  viewConditionValue?: {
    isView: boolean;
    viewValue: {
      filter: string;
      count: number;
    };
  };
}

export const SearchingBoardPeriodComponent = ({
  viewConditionValue,
  setViewConditionValue,
  setDate,
  date,
}: Props) => {
  const [selcted, setSelected] = useState("aMonth");
  const [period, setPeriod] = useRecoilState(productManagePeriod);

  useEffect(() => {
    const { startDate, endDate } = changePeriodTimeFormat(selcted);
    setPeriod(selcted);
    setDate({ startDate: startDate, endDate: endDate });
  }, [selcted]);

  const selectPeriod = (e: React.MouseEvent<HTMLButtonElement>) => {
    setSelected(e.currentTarget.value);
  };

  const changeDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDate({
      ...date,
      [name]: value,
    });
  };

  const checkManageViews = () => {
    if (viewConditionValue?.isView) {
      setViewConditionValue!({
        ...viewConditionValue!,
        isView: false,
      });
    } else {
      setViewConditionValue!({
        ...viewConditionValue!,
        isView: true,
      });
    }
  };

  const inputViewCondition = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setViewConditionValue &&
      setViewConditionValue({
        ...viewConditionValue!,
        viewValue: {
          ...viewConditionValue!.viewValue,
          [name]: value,
        },
      });
  };

  return (
    <div>
      <div className="col-12">
        <div className="payment-detail-1 gap-0 justify-content-between">
          <div className="d-flex align-items-center gap-5">
            <div className="payment-detail-inner d-flex align-items-center periodBox">
              <button
                onClick={selectPeriod}
                value="all"
                className={`dateSelector madebutton ${selcted === "all" && "selectedButton"
                  }`}
              >
                전체
              </button>
              <div className="buttonDivder" />
              <button
                onClick={selectPeriod}
                className={`dateSelector madebutton ${selcted === "aWeek" && "selectedButton"
                  }`}
                value="aWeek"
              >
                1주일
              </button>
              <div className="buttonDivder" />
              <button
                onClick={selectPeriod}
                className={`dateSelector madebutton ${selcted === "aMonth" && "selectedButton"
                  }`}
                value="aMonth"
              >
                1개월
              </button>
              <div className="buttonDivder" />
              <button
                onClick={selectPeriod}
                className={`dateSelector madebutton ${selcted === "threeMonth" && "selectedButton"
                  }`}
                value="threeMonth"
              >
                3개월
              </button>
              <div className="buttonDivder" />
              <button
                onClick={selectPeriod}
                className={`dateSelector madebutton ${selcted === "sixMonth" && "selectedButton"
                  }`}
                value="sixMonth"
              >
                6개월
              </button>
              <div className="buttonDivder" />
              <button
                onClick={selectPeriod}
                className={`dateSelector madebutton ${selcted === "aYear" && "selectedButton"
                  }`}
                value="aYear"
              >
                1년
              </button>
            </div>
            <div className="d-flex align-items-center gap-1">
              <div className="dateContainer">
                <input
                  value={date?.startDate as string}
                  name="startDate"
                  onChange={changeDate}
                  className="date-input"
                  type="date"
                />
                <div className="calender">
                  <CalendarIcon />
                </div>
              </div>
              ~
              <div className="dateContainer">
                <input
                  value={date?.endDate as string}
                  name="endDate"
                  onChange={changeDate}
                  className="date-input"
                  type="date"
                />
                <div className="calender">
                  <CalendarIcon />
                </div>
              </div>
            </div>
          </div>
          {viewConditionValue && (
            <div className="d-flex align-items-center gap-1 view-count-sec">
              <div className="d-flex align-items-center gap-2 view-count">
                <div className="form-group">
                  <input
                    onChange={checkManageViews}
                    readOnly
                    checked={viewConditionValue.isView}
                    type="checkbox"
                    id="htmlab"
                  />
                  <label htmlFor="htmlab"></label>
                </div>
                <p>유입수 관리</p>
              </div>
              {viewConditionValue.isView && setViewConditionValue && (
                <>
                  <div className="product-label product-label-1">
                    <input
                      type="number"
                      name="count"
                      onChange={inputViewCondition}
                      value={viewConditionValue.viewValue.count}
                      className="form-control"
                      id="product-name37s"
                      aria-describedby="emailHelp"
                      placeholder="숫자 입력"
                    />
                  </div>
                  <div className="product-label select-image width-select-1">
                    <div className="state-selection">
                      <select
                        onChange={inputViewCondition}
                        id="product-name311"
                        className="form-select"
                        name="filter"
                        value={viewConditionValue.viewValue.filter}
                      >
                        <option value="MORE">이상</option>
                        <option value="LESS">이하</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
