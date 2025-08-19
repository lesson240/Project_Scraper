// path: frontend/src/components/productUpload/modals/PriceSettingModal/hooks/usePriceCalculation.ts
import { useState, useCallback } from 'react';
import type { SelectedProduct, CalculatedPrice, FormulaSettings, ExchangeRate } from '../types/priceSetting.types';

export function usePriceCalculation() {
    const [calculatedPrices, setCalculatedPrices] = useState<CalculatedPrice[]>([]);

    const calculatePrices = useCallback((
        selectedProducts: SelectedProduct[],
        formulaSettings: FormulaSettings,
        exchangeRates: ExchangeRate[]
    ) => {
        const calculated: CalculatedPrice[] = selectedProducts.map(product => {
            // 환율 찾기
            const rate = exchangeRates.find(r => r.currency.includes(product.currency));
            const exchangeRate = typeof rate?.appliedRate === 'number' ? rate.appliedRate : 1;

            // 기본 판매가 계산
            const basePrice = Math.round(
                product.cost * exchangeRate * (1 + formulaSettings.baseMarginRate / 100) +
                formulaSettings.additionalMargin
            );

            // 플랫폼별 가격 계산
            const platformPrices = {
                coupang: Math.round(basePrice * (1 + 15 / 100)),
                auction: Math.round(basePrice * (1 + 15 / 100)),
                gmarket: Math.round(basePrice * (1 + 15 / 100)),
                elevenst: Math.round(basePrice * (1 + 15 / 100))
            };

            // 예상 마진 계산
            const totalCost = product.cost * exchangeRate + formulaSettings.baseShippingFee;
            const expectedMargin = basePrice - totalCost;
            const expectedMarginRate = (expectedMargin / basePrice) * 100;

            return {
                productId: product.id,
                basePrice,
                platformPrices,
                expectedMargin,
                expectedMarginRate
            };
        });

        setCalculatedPrices(calculated);
    }, []);

    return {
        calculatedPrices,
        calculatePrices
    };
}
