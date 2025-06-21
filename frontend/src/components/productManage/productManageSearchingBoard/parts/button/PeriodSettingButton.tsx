interface Props {
  checked : boolean
  handlePeriodBar : ()=> void
}

export const PeriodSettingButton = ({checked, handlePeriodBar} : Props) => {

  return (
    <button className="cancel-btn save-btn reset-btn period-btn" onClick={handlePeriodBar}>
      기간 설정
      <input className="toogle-in toogle-in-1" type="checkbox" checked={checked} readOnly/>
    </button>
  );
};
