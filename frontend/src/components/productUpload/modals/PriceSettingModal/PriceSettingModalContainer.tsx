// path: frontend/src/components/productUpload/modals/PriceSettingModal/PriceSettingModalContainer.tsx
import React, { useState, useEffect } from 'react';
import PriceSettingModal from './PriceSettingModal';
import { useExchangeRateManager } from '@/hooks/useExchangeRateManager';
import type {
    PriceSettingModalUIProps,
    SaveData,
    CalculatedProductData,
    SellingPriceFormulaInfo,
    PlatformMarginRateInfo,
    CalculatedItemInfo,
    PlatformMargins
} from '@/types/priceSetting.types';
import { priceSettingApi } from '@/apis/priceSettingApi';
import { ValidationError } from '@/exceptions/PriceSettingExceptions';
import { calculateAllProductsMargins } from '@/utils/priceCalculation';

// 기본값 상수 정의
const DEFAULT_FORMULA_SETTINGS: SellingPriceFormulaInfo = {
    freeShipping: false,
    optimizeShippingFee: true,
    baseMarginRate: 15,
    additionalMargin: 5000,
    baseShippingFee: 3000,
    returnShippingFee: 5000,
    exchangeShippingFee: 8000,
    internationalShippingFee: 4000
};

const DEFAULT_PLATFORM_MARGIN_RATE: PlatformMarginRateInfo = {
    smartstore: 35,
    coupang: 15,
    auction: 15,
    gmarket: 15,
    elevenst: 15,
    openmarket: 15
};

type ContainerProps = Pick<PriceSettingModalUIProps, 'isOpen' | 'onClose' | 'selectedProducts' | 'onSave'>;

export default function PriceSettingModalContainer(props: ContainerProps) {
    const [formulaSettings, setFormulaSettings] = useState<SellingPriceFormulaInfo>(DEFAULT_FORMULA_SETTINGS);
    const [platformMarginRates, setPlatformMarginRates] = useState<PlatformMarginRateInfo>(DEFAULT_PLATFORM_MARGIN_RATE);
    const [isExchangeRateExpanded, setIsExchangeRateExpanded] = useState(false);
    const [isFormulaExpanded, setIsFormulaExpanded] = useState(true);
    const [isCalculated, setIsCalculated] = useState(false);
    const [calculatedPrices, setCalculatedPrices] = useState<CalculatedProductData[]>([]);
    const [isLoadingSavedData, setIsLoadingSavedData] = useState(false);

    const {
        exchangeRates,
        isLoading: ratesLoading,
        tariffPeriod,
        error,
        updateAppliedRate,
        fetchFrontendExchangeRates
    } = useExchangeRateManager();

    useEffect(() => {
        if (props.isOpen && props.selectedProducts && props.selectedProducts.length > 0) {
            setIsCalculated(false);
            // 환율 데이터 자동 로딩
            fetchFrontendExchangeRates();
            loadSavedPriceSettingData();
        }
    }, [props.isOpen, props.selectedProducts]);

    const loadSavedPriceSettingData = async (): Promise<void> => {
        if (!props.selectedProducts || props.selectedProducts.length === 0) {
            console.warn('선택된 상품이 없어서 저장된 데이터를 로드할 수 없습니다.');
            return;
        }

        const originGoodsCode = props.selectedProducts[0]?.originGoodsCode;
        if (!originGoodsCode) {
            console.warn('상품 코드가 없어서 저장된 데이터를 로드할 수 없습니다.');
            return;
        }

        try {
            setIsLoadingSavedData(true);
            const savedData = await priceSettingApi.load(originGoodsCode);

            if (savedData) {
                // 환율 데이터 복원 (새로운 구조에 맞춰 수정)
                if (savedData.exchangeRateInfo) {
                    const updatedRates = exchangeRates.map(rate => {
                        if (rate.currencyCode === savedData.exchangeRateInfo.currencyCode) {
                            return { ...rate, appliedRate: savedData.exchangeRateInfo.appliedRate };
                        }
                        return rate;
                    });

                    updatedRates.forEach(rate => {
                        updateAppliedRate(rate.currencyCode, rate.appliedRate);
                    });
                }

                // 공식 설정 복원 (새로운 구조에 맞춰 수정)
                if (savedData.sellingPriceFormulaInfo) {
                    const formulaInfo = savedData.sellingPriceFormulaInfo;
                    setFormulaSettings(prev => ({
                        ...prev,
                        baseMarginRate: formulaInfo.baseMarginRate || prev.baseMarginRate,
                        additionalMargin: formulaInfo.additionalMargin || prev.additionalMargin,
                        baseShippingFee: formulaInfo.baseShippingFee || prev.baseShippingFee,
                        returnShippingFee: formulaInfo.returnShippingFee || prev.returnShippingFee,
                        exchangeShippingFee: formulaInfo.exchangeShippingFee || prev.exchangeShippingFee,
                        internationalShippingFee: formulaInfo.internationalShippingFee || prev.internationalShippingFee
                    }));
                }

                // 플랫폼 마진율율 복원
                if (savedData.platformMarginRateInfo) {
                    const marginInfo = savedData.platformMarginRateInfo;
                    setPlatformMarginRates(prev => ({
                        smartstore: marginInfo.smartstore,
                        coupang: marginInfo.coupang,
                        auction: marginInfo.auction,
                        gmarket: marginInfo.gmarket,
                        elevenst: marginInfo.elevenst,
                        openmarket: marginInfo.openmarket
                    }));
                }
            }
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('저장된 가격 설정 데이터 로드 실패:', error);
            }
        } finally {
            setIsLoadingSavedData(false);
        }
    };

    // const calculateBasePrice = (product: Product): number => {
    //     const originalPrice = typeof product.originalPrice === 'string'
    //         ? parseFloat(product.originalPrice)
    //         : product.originalPrice;

    //     if (isNaN(originalPrice) || originalPrice <= 0) {
    //         throw new ValidationError('유효하지 않은 원본 가격입니다.', 'originalPrice', originalPrice);
    //     }

    //     // 기본 가격 계산: 원본 가격 × (1 + 기본 마진율)
    //     return originalPrice * (1 + formulaSettings.baseMarginRate / 100);
    // };

    const handleCalculateMargin = async (): Promise<void> => {
        if (import.meta.env.DEV) {
            // console.log('🚀 마진 계산 시작...');
            // console.log('📊 선택된 상품 수:', props.selectedProducts.length);
            // console.log('💱 환율 데이터 수:', exchangeRates.length);
            // console.log('⚙️ 공식 설정:', formulaSettings);
            // console.log('💰 플랫폼 기본 마진율:', platformMarginRates);
        }

        if (props.selectedProducts.length === 0) {
            if (import.meta.env.DEV) {
                console.error('❌ 선택된 상품이 없습니다.');
            }
            throw new ValidationError('선택된 상품이 없습니다.', 'selectedProducts', props.selectedProducts);
        }

        if (exchangeRates.length === 0) {
            if (import.meta.env.DEV) {
                console.error('❌ 환율 데이터가 없습니다.');
            }
            throw new ValidationError('환율 데이터가 없습니다.', 'exchangeRates', exchangeRates);
        }

        try {
            setIsCalculated(false);

            // priceCalculation.ts의 함수 사용
            const newCalculatedPrices = calculateAllProductsMargins(
                props.selectedProducts.map(product => ({
                    originGoodsCode: product.originGoodsCode,
                    originalPrice: typeof product.originalPrice === 'string'
                        ? parseFloat(product.originalPrice)
                        : product.originalPrice,
                    exchangeRate: 1, // 기본값, 실제로는 환율 데이터에서 가져와야 함
                    baseMarginRate: formulaSettings.baseMarginRate,
                    additionalMargin: formulaSettings.additionalMargin,
                    internationalShippingFee: formulaSettings.internationalShippingFee
                })),
                formulaSettings.baseMarginRate,
                formulaSettings.additionalMargin,
                formulaSettings.internationalShippingFee,
                platformMarginRates
            );
            // if (import.meta.env.DEV) {
            //     console.log('📋 최종 계산된 가격 목록:', newCalculatedPrices);
            // }

            setCalculatedPrices(newCalculatedPrices);
            setIsCalculated(true);

            // if (import.meta.env.DEV) {
            //     console.log('✅ 마진 계산 완료:', newCalculatedPrices.length, '개 상품');
            // }
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('❌ 마진 계산 실패:', error);
            }
            throw error;
        }
    };

    const handleSave = async (saveData: SaveData): Promise<void> => {

        if (!isCalculated || calculatedPrices.length === 0) {
            throw new ValidationError('계산된 데이터가 없습니다. 먼저 마진을 계산해주세요.', 'calculatedPrices', calculatedPrices);
        }

        const originGoodsCode = calculatedPrices[0]?.originGoodsCode;
        if (import.meta.env.DEV) {
            console.log('🎯 저장할 상품 코드:', originGoodsCode);
        }

        if (!originGoodsCode) {
            throw new ValidationError('계산된 상품 데이터에서 상품 코드를 찾을 수 없습니다.', 'originGoodsCode', originGoodsCode);
        }

        try {
            await priceSettingApi.save(saveData);
            props.onSave(saveData);

            if (import.meta.env.DEV) {
                console.log('💾 가격 설정 저장 완료');
            }
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('❌ 가격 설정 저장 실패:', error);
            }
            throw error;
        }
    };

    const handleExchangeRateToggle = (): void => {
        setIsExchangeRateExpanded(!isExchangeRateExpanded);
    };

    const handleFormulaToggle = (): void => {
        setIsFormulaExpanded(!isFormulaExpanded);
    };

    const handleSyncRates = async (): Promise<void> => {
        try {
            await fetchFrontendExchangeRates();
            if (import.meta.env.DEV) {
                console.log('🔄 환율 동기화 완료');
            }
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('❌ 환율 동기화 실패:', error);
            }
            throw error;
        }
    };

    const handleReset = (): void => {
        setFormulaSettings(DEFAULT_FORMULA_SETTINGS);
        setPlatformMarginRates(DEFAULT_PLATFORM_MARGIN_RATE);
        setIsCalculated(false);
        setCalculatedPrices([]);
    };

    if (!props.isOpen) return null;

    return (
        <PriceSettingModal
            isOpen={props.isOpen}
            onClose={props.onClose}
            selectedProducts={props.selectedProducts}
            exchangeRates={exchangeRates}
            calculatedPrices={calculatedPrices}
            isCalculated={isCalculated}
            tariffPeriod={tariffPeriod}
            isLoading={ratesLoading}
            error={error}
            onAppliedRateChange={updateAppliedRate}
            onSyncRates={handleSyncRates}
            sellingPriceFormulaInfo={formulaSettings}
            platformMargins={{
                smartstore: { ExpectedMargin: 0, ExpectedMarginRate: platformMarginRates.smartstore, selling_price: 0 },
                coupang: { ExpectedMargin: 0, ExpectedMarginRate: platformMarginRates.coupang, selling_price: 0 },
                auction: { ExpectedMargin: 0, ExpectedMarginRate: platformMarginRates.auction, selling_price: 0 },
                gmarket: { ExpectedMargin: 0, ExpectedMarginRate: platformMarginRates.gmarket, selling_price: 0 },
                elevenst: { ExpectedMargin: 0, ExpectedMarginRate: platformMarginRates.elevenst, selling_price: 0 },
                openmarket: { ExpectedMargin: 0, ExpectedMarginRate: platformMarginRates.openmarket, selling_price: 0 }
            }}
            onFormulaChange={(field, value) => setFormulaSettings(prev => ({ ...prev, [field]: value }))}
            onFormulaReset={() => setFormulaSettings(DEFAULT_FORMULA_SETTINGS)}
            onMarginChange={(platform, value) => {
                setPlatformMarginRates(prev => ({
                    ...prev,
                    [platform]: value
                }));
            }}
            onMarginReset={() => setPlatformMarginRates(DEFAULT_PLATFORM_MARGIN_RATE)}
            onPlatformMarginChange={(platform, value) => {
                setPlatformMarginRates(prev => ({
                    ...prev,
                    [platform]: value
                }));
            }}
            isExchangeRateExpanded={isExchangeRateExpanded}
            isFormulaExpanded={isFormulaExpanded}
            onExchangeRateToggle={handleExchangeRateToggle}
            onFormulaToggle={handleFormulaToggle}
            onCalculateMargin={handleCalculateMargin}
            onSave={handleSave}
            onReset={handleReset}
        />
    );
}


