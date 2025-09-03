// path: frontend/src/components/productUpload/modals/PriceSettingModal/PriceSettingModalContainer.tsx
import React, { useState, useEffect } from 'react';
import PriceSettingModal from './PriceSettingModal';
import { useExchangeRateManager } from '@/hooks/useExchangeRateManager';
import { useSettingStatus } from '@/hooks/useSettingStatus';
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
import Toast from "@/components/common/Toast";

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
    const [formulaSettings, setFormulaSettings] = useState<SellingPriceFormulaInfo | null>(null);
    const [platformMarginRates, setPlatformMarginRates] = useState<PlatformMarginRateInfo | null>(null);
    const [isExchangeRateExpanded, setIsExchangeRateExpanded] = useState(false);
    const [isFormulaExpanded, setIsFormulaExpanded] = useState(true);
    const [isCalculated, setIsCalculated] = useState(false);
    const [calculatedPrices, setCalculatedPrices] = useState<CalculatedProductData[]>([]);
    const [isLoadingSavedData, setIsLoadingSavedData] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [toastMessage, setToastMessage] = useState<string>('');
    const [showToast, setShowToast] = useState<boolean>(false);

    const {
        exchangeRates,
        isLoading: ratesLoading,
        tariffPeriod,
        error,
        updateAppliedRate,
        fetchFrontendExchangeRates
    } = useExchangeRateManager();

    // 설정 상태 관리
    const settingStatus = useSettingStatus(
        exchangeRates,
        formulaSettings,
        platformMarginRates,
        calculatedPrices
    );

    // Toast 함수들
    const showToastMessage = (message: string) => {
        setToastMessage(message);
        setShowToast(true);
    };

    const closeToast = () => {
        setShowToast(false);
        setToastMessage('');
    };

    useEffect(() => {
        if (props.isOpen && props.selectedProducts && props.selectedProducts.length > 0) {
            setIsCalculated(false);
            // 환율 데이터 자동 로딩
            fetchFrontendExchangeRates();
            // MongoDB 데이터 존재 여부 확인 후 로드
            loadSavedPriceSettingData();
        }
    }, [props.isOpen, props.selectedProducts]);

    const loadSavedPriceSettingData = async (): Promise<void> => {
        if (!props.selectedProducts || props.selectedProducts.length === 0) {
            console.warn('선택된 상품이 없어서 저장된 데이터를 로드할 수 없습니다.');
            return;
        }

        try {
            setIsLoadingSavedData(true);
            
            const savedData = await priceSettingApi.getInfo();

            // 데이터 존재 여부를 더 정확하게 검증
            const hasFormulaData = savedData && 
                savedData.sellingPriceFormulaInfo && 
                typeof savedData.sellingPriceFormulaInfo === 'object';
                
            const hasMarginData = savedData && 
                savedData.platformMarginRateInfo && 
                typeof savedData.platformMarginRateInfo === 'object';

            if (hasFormulaData && hasMarginData) {



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
                        internationalShippingFee: formulaInfo.internationalShippingFee || prev.internationalShippingFee,
                        freeShipping: formulaInfo.freeShipping !== undefined ? formulaInfo.freeShipping : prev.freeShipping,
                        optimizeShippingFee: formulaInfo.optimizeShippingFee !== undefined ? formulaInfo.optimizeShippingFee : prev.optimizeShippingFee
                    }));
                }

                // 플랫폼 마진율율 복원
                if (savedData.platformMarginRateInfo) {
                    const marginInfo = savedData.platformMarginRateInfo;
                    setPlatformMarginRates(prev => ({
                        smartstore: marginInfo.smartstore || prev.smartstore,
                        coupang: marginInfo.coupang || prev.coupang,
                        auction: marginInfo.auction || prev.auction,
                        gmarket: marginInfo.gmarket || prev.gmarket,
                        elevenst: marginInfo.elevenst || prev.elevenst,
                        openmarket: marginInfo.openmarket || prev.openmarket
                    }));
                }
                
                // 환율 데이터 복원
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


            } else {
                // 3) 데이터가 없다면 기본 상수 로드
                if (import.meta.env.DEV) {
                    console.log('�� 기본 가격 설정 상수를 사용합니다.');
                    console.log('❌ MongoDB 데이터 부족:', {
                        hasFormulaData,
                        hasMarginData,
                        savedData: !!savedData
                    });
                }
                setFormulaSettings(DEFAULT_FORMULA_SETTINGS);
                setPlatformMarginRates(DEFAULT_PLATFORM_MARGIN_RATE);
            }

            setIsDataLoaded(true);
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('저장된 가격 설정 데이터 로드 실패:', error);
            }
                        
            // 에러 발생 시 기본값 사용
            setFormulaSettings(DEFAULT_FORMULA_SETTINGS);
            setPlatformMarginRates(DEFAULT_PLATFORM_MARGIN_RATE);
            setIsDataLoaded(true);

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

    // 설정 아이콘 클릭 핸들러들
    const handleExchangeRateSetting = async (): Promise<void> => {
        try {
            if (!exchangeRates || exchangeRates.length === 0) {
                showToastMessage('환율 정보가 없습니다.');
                return;
            }

            const exchangeRateData = exchangeRates.map(rate => ({
                currencyCode: rate.currencyCode,
                appliedRate: rate.appliedRate,
                lastUpdated: rate.lastUpdated,
                source: rate.source
            }));

            await priceSettingApi.saveBaseSetting('exchangeRate', exchangeRateData);
            showToastMessage('환율 설정이 저장되었습니다.');
        } catch (error) {
            console.error('환율 설정 저장 실패:', error);
            showToastMessage('환율 설정 저장에 실패했습니다.');
        }
    };

    const handleFormulaAndMarginSetting = async (): Promise<void> => {
        try {
            if (!formulaSettings || !platformMarginRates) {
                showToastMessage('공식 설정 또는 플랫폼 마진 정보가 없습니다.');
                return;
            }

            const combinedData = {
                sellingPriceFormulaInfo: formulaSettings,
                platformMarginRateInfo: platformMarginRates
            };

            await priceSettingApi.saveBaseSetting('formulaAndMargin', combinedData);
            showToastMessage('공식 및 마진 설정이 저장되었습니다.');
        } catch (error) {
            console.error('공식 및 마진 설정 저장 실패:', error);
            showToastMessage('공식 및 마진 설정 저장에 실패했습니다.');
        }
    };

    const handleReset = (): void => {
        setFormulaSettings(DEFAULT_FORMULA_SETTINGS);
        setPlatformMarginRates(DEFAULT_PLATFORM_MARGIN_RATE);
        setIsCalculated(false);
        setCalculatedPrices([]);
    };

    // 데이터가 로드되기 전까지는 로딩 상태 표시
    if (!props.isOpen || !isDataLoaded || !formulaSettings || !platformMarginRates) {
        return null;
    }

    return (
        <>
            {showToast && (
                <Toast 
                    message={toastMessage} 
                    duration={3000} 
                    onClose={closeToast} 
                />
            )}

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
                // 새로운 props 추가
                settingStatus={settingStatus}
                onExchangeRateSetting={handleExchangeRateSetting}
                onFormulaAndMarginSetting={handleFormulaAndMarginSetting}
            />
        </>
    );
}


