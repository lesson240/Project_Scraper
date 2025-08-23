import React from "react";
import Button from "@/components/common/Button";
import "@/styles/collect/filterButtons.css";

type Props = {
  onReset: () => void;
  onSave: (originGoodsCode: string) => void;
  onCalculateMargin: () => void;
  originGoodsCode: string;
  isCalculated: boolean; // 예상마진 계산 완료 여부
};

export default function PriceSettingModalFooter({ onSave, onReset, onCalculateMargin, originGoodsCode, isCalculated }: Props) {
  const handleSave = () => {
    onSave(originGoodsCode);
  };

  return (
    <div className="button-box">
      <Button variant="fourth" onClick={onReset}>초기화</Button>
      <Button variant="fourth" onClick={onCalculateMargin}>예상 마진</Button>
      <Button 
        variant="primary" 
        onClick={handleSave}
        disabled={!isCalculated}
        title={!isCalculated ? "예상 마진을 먼저 계산해주세요" : "설정을 저장합니다"}
      >
        저장
      </Button>
    </div>
  );
}
