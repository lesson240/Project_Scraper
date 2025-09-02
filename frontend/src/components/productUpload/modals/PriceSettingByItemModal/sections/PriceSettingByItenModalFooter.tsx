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
  }>;
  showToastMessage?: (message: string) => void;
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
  selectedProducts,
  showToastMessage
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
          platformMarginRateInfo,
          undefined // totalPrice는 별도로 처리하지 않음 (기본값 사용)
        );
      });

      // 계산된 결과를 부모 컴포넌트에 전달
      onCalculateMargin(calculatedProducts);
      
    } catch (error) {
      console.error('마진 계산 중 오류 발생:', error);
    }
  };


  const handleSave = () => {
    try {
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
          optimizeShippingFee: sellingPriceFormulaInfo.optimizeShippingFee
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
      
      // Toast는 Container에서 처리하므로 여기서는 호출하지 않음
      // showToastMessage?.('저장이 완료되었습니다!');
      
    } catch (error) {
      showToastMessage?.('저장 중 오류가 발생했습니다.');
      throw error;
    }
  };

  return (
    <div className="button-box">
      <Button variant="fourth" onClick={onReset}>초기화</Button>
      <Button variant="fourth" onClick={handleCalculateMargin}>마진 계산</Button>
      <Button
        variant="primary"
        onClick={() => {
          if (!isCalculated) {
            showToastMessage?.('마진 계산을 먼저 해주세요.');
            return;
          }
          handleSave();
        }}
      >
        저장
      </Button>
    </div>
  );
}
