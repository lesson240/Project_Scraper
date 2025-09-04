import React from "react";
import Button from "@/components/common/Button";
import "@/styles/collect/filterButtons.css";
import type {
  ExchangeRateInfo,
  SellingPriceFormulaInfo,
  SaveData,
  CalculatedProductData,
  PlatformMarginRateInfo,
  PlatformMargins,
  MarginListByItems,
} from "@/types/priceSetting.types";

import { calculatePlatformMargins } from "@/utils/priceCalculation";
import { ValidationError } from "@/exceptions/PriceSettingExceptions";

type Props = {
  onReset: () => void;
  onSave: (data: SaveData) => void;
  onCalculateMargin: (calculatedProducts?: CalculatedProductData[]) => void;
  originGoodsCode: string;
  isCalculated: boolean;
  exchangeRatesInfo: ExchangeRateInfo[];
  sellingPriceFormulaInfo: SellingPriceFormulaInfo;
  platformMarginRateInfo: PlatformMarginRateInfo;
  calculatedProductData: CalculatedProductData[];
  selectedProducts: Array<{
    originGoodsCode: string;
    originalPrice: number;
    exchangeRate?: number;
    baseMarginRate?: number;
    additionalMargin?: number;
    internationalShippingFee?: number;
    baseDiscount?: number;
    baseDiscountUnit?: string;
  }>;
};

export default function PriceSettingModalFooter({
  onSave,
  onReset,
  onCalculateMargin,
  originGoodsCode,
  isCalculated,
  exchangeRatesInfo,
  sellingPriceFormulaInfo,
  platformMarginRateInfo,
  calculatedProductData,
  selectedProducts
}: Props) {

  const handleCalculateMargin = () => {
    // ✅ 실제 마진 계산 로직 구현
    try {
      // 각 상품별로 마진 계산
      const calculatedProducts = selectedProducts.map(product => {
        return calculatePlatformMargins(
          product.originGoodsCode,
          product.originalPrice,
          product.exchangeRate || 1,
          sellingPriceFormulaInfo.baseMarginRate,
          sellingPriceFormulaInfo.additionalMargin,
          sellingPriceFormulaInfo.internationalShippingFee,
          sellingPriceFormulaInfo.baseDiscount,
          sellingPriceFormulaInfo.baseDiscountUnit,
          platformMarginRateInfo
        );
      });

      // 계산된 결과를 부모 컴포넌트에 전달
      onCalculateMargin(calculatedProducts);

      console.log('마진 계산 완료:', calculatedProducts);
    } catch (error) {
      console.error('마진 계산 중 오류 발생:', error);
      // 에러 처리 로직 추가 가능
    }
  };


  const handleSave = () => {
    // 데이터 유효성 검증
    if (!originGoodsCode) {
      throw new ValidationError('상품 코드가 없습니다.', 'originGoodsCode', originGoodsCode);
    }

    if (!isCalculated) {
      throw new ValidationError('예상 마진을 먼저 계산해주세요.', 'isCalculated', isCalculated);
    }

    if (calculatedProductData.length === 0) {
      throw new ValidationError('계산된 상품 데이터가 없습니다.', 'calculatedProductData', calculatedProductData);
    }

    // 저장할 데이터 구성 - SaveData 타입에 맞게 수정
    const saveData: SaveData = {
      exchangeRates: exchangeRatesInfo.map(rate => ({
        currency: rate.currencyCode,
        value: rate.appliedRate
      })),
      formulaSettings: {
        baseMarginRate: sellingPriceFormulaInfo.baseMarginRate,
        additionalMargin: sellingPriceFormulaInfo.additionalMargin,
        baseShippingFee: sellingPriceFormulaInfo.baseShippingFee,
        returnShippingFee: sellingPriceFormulaInfo.returnShippingFee,
        exchangeShippingFee: sellingPriceFormulaInfo.exchangeShippingFee,
        internationalShippingFee: sellingPriceFormulaInfo.internationalShippingFee,
        freeShipping: sellingPriceFormulaInfo.freeShipping,
        optimizeShippingFee: sellingPriceFormulaInfo.optimizeShippingFee,
        baseDiscount: sellingPriceFormulaInfo.baseDiscount,
        baseDiscountUnit: sellingPriceFormulaInfo.baseDiscountUnit
      },
      platformMarginRateInfo,
      marginListByItems: {
        items: calculatedProductData.reduce((acc, product) => {
          acc[product.originGoodsCode] = {
            smartstore: product.marginList.smartstore,
            coupang: product.marginList.coupang,
            auction: product.marginList.auction,
            gmarket: product.marginList.gmarket,
            elevenst: product.marginList.elevenst,
            openmarket: product.marginList.openmarket
          };
          return acc;
        }, {} as Record<string, PlatformMargins>)
      }
    };

    // 부모 컴포넌트의 onSave 호출
    onSave(saveData);
  };

  return (
    <div className="button-box">
      <Button variant="fourth" onClick={onReset}>초기화</Button>
      <Button variant="fourth" onClick={handleCalculateMargin}>마진 계산</Button>
      <Button
        variant="primary"
        onClick={handleSave}
        disabled={!isCalculated}
        title={!isCalculated ? "마진 계산을 먼저 해주세요" : "설정을 저장합니다"}
      >
        저장
      </Button>
    </div>
  );
}
