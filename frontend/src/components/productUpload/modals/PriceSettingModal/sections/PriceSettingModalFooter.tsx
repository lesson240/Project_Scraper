import React from "react";
import Button from "@/components/common/Button";
import "@/styles/collect/filterButtons.css";
import type { SaveData, CalculatedPrice } from "@/types/priceSetting.types";

type Props = {
  onReset: () => void;
  onSave: (data: SaveData) => void; // Modified to accept SaveData
  onCalculateMargin: () => void;
  originGoodsCode: string;
  isCalculated: boolean; // 예상마진 계산 완료 여부
  // 데이터 수집을 위한 props 추가
  exchangeRates: Array<{ currency: string; value: number }>;
  formulaSettings: {
    costFormula: string;
    priceFormula: string;
    marginFormula: string;
    freeShipping: boolean;
    optimizeShippingFee: boolean;
    baseMarginRate: number;
    additionalMargin: number;
    baseShippingFee: number;
    returnShippingFee: number;
    exchangeShippingFee: number;
  };
  platformMargins: {
    coupang: number;
    auction: number;
    gmarket: number;
    elevenst: number;
    openmarket: number;
  };
  calculatedProducts: CalculatedPrice[];  // 🆕 새로운 CalculatedPrice 타입 사용
};

export default function PriceSettingModalFooter({
  onSave,
  onReset,
  onCalculateMargin,
  originGoodsCode,
  isCalculated,
  exchangeRates,
  formulaSettings,
  platformMargins,
  calculatedProducts
}: Props) {

  const handleSave = () => {
    // 저장할 데이터 구성
    const saveData: SaveData = {
      exchangeRates,
      formulaSettings,
      platformMargins,
      calculatedProducts,
      originGoodsCode
    };

    console.log('저장할 데이터:', saveData);

    // 부모 컴포넌트의 onSave 호출
    onSave(saveData);
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
