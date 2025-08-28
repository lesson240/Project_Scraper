import React from "react";
import Button from "@/components/common/Button";
import "@/styles/collect/filterButtons.css";
import type { SaveData, CalculatedProductData, FormulaSettings } from "@/types/priceSetting.types";
import type { PlatformMargins } from "@/utils/priceCalculation";
import { ValidationError } from "@/exceptions/PriceSettingExceptions";

type Props = {
  onReset: () => void;
  onSave: (data: SaveData) => void;
  onCalculateMargin: () => void;
  originGoodsCode: string;
  isCalculated: boolean;
  exchangeRates: Array<{ currency: string; value: number }>;
  formulaSettings: FormulaSettings;
  platformMargins: PlatformMargins;
  calculatedProducts: CalculatedProductData[];
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
    // 데이터 유효성 검증
    if (!originGoodsCode) {
      throw new ValidationError('상품 코드가 없습니다.', 'originGoodsCode', originGoodsCode);
    }

    if (!isCalculated) {
      throw new ValidationError('예상 마진을 먼저 계산해주세요.', 'isCalculated', isCalculated);
    }

    if (calculatedProducts.length === 0) {
      throw new ValidationError('계산된 상품 데이터가 없습니다.', 'calculatedProducts', calculatedProducts);
    }

    // 저장할 데이터 구성
    const saveData: SaveData = {
      exchangeRates,
      formulaSettings,
      platformMargins,
      calculatedProducts,
      originGoodsCode
    };

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
