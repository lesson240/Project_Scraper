// path: frontend/src/components/productUpload/modals/PriceSettingModal/PriceSettingModalContainer.tsx
import React, { useState, useEffect } from 'react';
import PriceSettingModal from './PriceSettingModal';
import { useExchangeRateManager } from '@/hooks/useExchangeRateManager';
import { getExchangeRatesForFrontend } from '@/apis/exchangeRateApi';
import type { PriceSettingModalProps, Product } from '@/types/priceSetting.types';

import type { FormulaSettings, PlatformMargins } from '@/types/priceSetting.types';

export default function PriceSettingModalContainer(props: PriceSettingModalProps) {
    const [formulaSettings, setFormulaSettings] = useState<FormulaSettings>({
        costFormula: 'basePrice * 1.2',
        priceFormula: 'costPrice + margin',
        marginFormula: 'basePrice * 0.15',
        freeShipping: false,
        optimizeShippingFee: true,
        baseMarginRate: 15,
        additionalMargin: 0,
        baseShippingFee: 3000,
        returnShippingFee: 5000,
        exchangeShippingFee: 8000
    });

    const [platformMargins, setPlatformMargins] = useState<PlatformMargins>({
        coupang: 15,
        auction: 15,
        gmarket: 15,
        elevenst: 15,
        openmarket: 15
    });

    // 섹션 토글 상태
    const [isExchangeRateExpanded, setIsExchangeRateExpanded] = useState(false); // 환율 설정은 기본적으로 접힘
    const [isFormulaExpanded, setIsFormulaExpanded] = useState(true); // 공식 설정도 기본적으로 펼쳐짐

    // 마진 계산 완료 상태
    const [isCalculated, setIsCalculated] = useState(false);

    // 환율 정보 훅 사용
    const { exchangeRates, isLoading: ratesLoading, tariffPeriod, error, updateAppliedRate, fetchFrontendExchangeRates } = useExchangeRateManager();

    // 가격 계산 로직 (더미 데이터)
    const [calculatedPrices, setCalculatedPrices] = useState<any[]>([]);

    useEffect(() => {
        if (props.isOpen && props.selectedProducts.length > 0) {
            // 모달이 열릴 때마다 계산 상태 초기화
            setIsCalculated(false);
        }
    }, [props.isOpen, props.selectedProducts]);

    const handleFormulaChange = (field: string, value: number | boolean) => {
        setFormulaSettings(prev => ({
            ...prev,
            [field]: value
        }));
        // 공식이 변경되면 계산 상태 초기화
        setIsCalculated(false);
    };

    const handlePlatformMarginChange = (platform: string, value: number) => {
        setPlatformMargins(prev => ({
            ...prev,
            [platform]: value
        }));
        // 플랫폼 마진이 변경되면 계산 상태 초기화
        setIsCalculated(false);
    };

    const handleCalculateMargin = () => {
        if (props.selectedProducts.length > 0) {
            // 더미 가격 계산 로직
            const calculated = props.selectedProducts.map(product => ({
                productId: product.id,
                basePrice: 50000,
                platformPrices: {
                    coupang: 57500,
                    auction: 57500,
                    gmarket: 57500,
                    elevenst: 57500
                },
                expectedMargin: 15000,
                expectedMarginRate: 26.1
            }));

            setCalculatedPrices(calculated);
            setIsCalculated(true);
        }
    };

    const handleSave = () => {
        if (!props.onSave) return;

        // 선택된 상품들의 가격 정보 업데이트
        const updatedProducts = props.selectedProducts.map(product => {
            const calculated = calculatedPrices.find(calc => calc.productId === product.id);
            const exchangeRate = exchangeRates.find(rate => rate.currencyCode === product.currencyCode);

            // 설정 상품가 계산 (원본 할인가 * 환율 + 마진)
            let settingPrice = 0;
            if (calculated && exchangeRate && typeof exchangeRate.appliedRate === 'number') {
                const originalPrice = typeof product.originalPrice === 'string'
                    ? parseFloat(product.originalPrice)
                    : product.originalPrice;
                settingPrice = Math.round(originalPrice * exchangeRate.appliedRate + calculated.expectedMargin);
            }

            return {
                ...product,
                settingPrice,
                calculatedPrice: calculated,
                exchangeRate: typeof exchangeRate?.appliedRate === 'number' ? exchangeRate.appliedRate : 0
            };
        });

        const settings = {
            formula: formulaSettings,
            platformMargins,
            exchangeRates,
            calculatedPrices,
            updatedProducts
        };

        props.onSave(settings);
        props.onClose();
    };

    const handleReset = () => {
        setFormulaSettings({
            costFormula: 'basePrice * 1.2',
            priceFormula: 'costPrice + margin',
            marginFormula: 'basePrice * 0.15',
            freeShipping: false,
            optimizeShippingFee: true,
            baseMarginRate: 15,
            additionalMargin: 0,
            baseShippingFee: 3000,
            returnShippingFee: 5000,
            exchangeShippingFee: 8000
        });
        setPlatformMargins({
            coupang: 15,
            auction: 15,
            gmarket: 15,
            elevenst: 15,
            openmarket: 15
        });
        // 초기화 시 계산 상태도 리셋
        setIsCalculated(false);
    };

    const handleExchangeRateToggle = async () => {
        const newExpandedState = !isExchangeRateExpanded;
        setIsExchangeRateExpanded(newExpandedState);

        // 환율 설정 섹션이 펼쳐질 때 새로운 API 호출
        if (newExpandedState) {
            try {
                console.log('환율 설정 섹션 펼침 - 프론트엔드 전용 API 호출 중...');

                // useExchangeRateManager의 fetchFrontendExchangeRates 함수 호출
                await fetchFrontendExchangeRates();

                console.log('환율 데이터 업데이트 완료');
            } catch (error) {
                console.error('프론트엔드 환율 정보 조회 중 오류:', error);
            }
        }
    };

    const handleFormulaToggle = () => {
        setIsFormulaExpanded(!isFormulaExpanded);
    };

    const handleAppliedRateChange = (currency: string, value: number) => {
        updateAppliedRate(currency, value);
    };

    const handleSyncRates = async () => {
        // 환율 동기화 로직 (MongoDB에 저장)
        console.log('환율 동기화 실행');
        try {
            // TODO: 실제 동기화 API 호출
            // await syncExchangeRates();
            console.log('환율 동기화 완료');
        } catch (error) {
            console.error('환율 동기화 실패:', error);
        }
    };

    return (
        <PriceSettingModal
            {...props}
            formulaSettings={formulaSettings}
            platformMargins={platformMargins}
            exchangeRates={exchangeRates}
            calculatedPrices={calculatedPrices}
            isCalculated={isCalculated}
            tariffPeriod={tariffPeriod}
            isLoading={ratesLoading}
            error={error}
            isExchangeRateExpanded={isExchangeRateExpanded}
            isFormulaExpanded={isFormulaExpanded}
            onFormulaChange={handleFormulaChange}
            onPlatformMarginChange={handlePlatformMarginChange}
            onCalculateMargin={handleCalculateMargin}
            onSave={handleSave}
            onReset={handleReset}
            onExchangeRateToggle={handleExchangeRateToggle}
            onFormulaToggle={handleFormulaToggle}
            onAppliedRateChange={handleAppliedRateChange}
            onSyncRates={handleSyncRates}
            onFormulaReset={handleReset}
            onMarginChange={handlePlatformMarginChange}
            onMarginReset={handleReset}
        />
    );
}
