import React from "react";
import Button from "@/components/common/Button";
import "@/styles/collect/filterButtons.css";


type Props = {
  onReset: () => void;
  onPeriodset: () => void;
  onInquiry: () => void;
};



export default function FilterButtons({ onReset, onPeriodset, onInquiry }: Props) {
  return (
    <div className="button-box">
      <Button variant="fourth" onClick={onReset}>초기화</Button>
      <Button variant="third-rate" onClick={onPeriodset}>기간 설정</Button>
      <Button variant="primary" onClick={onInquiry}>조회</Button>
    </div>
  );
}