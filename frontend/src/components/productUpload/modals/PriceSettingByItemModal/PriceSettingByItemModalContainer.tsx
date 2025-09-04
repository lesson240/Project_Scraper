// path: frontend/src/components/productUpload/modals/PriceSettingByItemModal/PriceSettingByItemModalContainer.tsx
import React, { useState, useEffect } from 'react';
import PriceSettingByItemModal from './PriceSettingByItemModal';
import { useExchangeRateManager } from '@/hooks/useExchangeRateManager';
import { useSettingStatus } from '@/hooks/useSettingStatus';
import type {
    PriceSettingModalUIProps,
    SaveData,
    CalculatedProductData,
    SellingPriceFormulaInfo,
    PlatformMarginRateInfo,
    PlatformMarginRates,
} from '@/types/priceSetting.types';
import { priceSettingApi } from '@/apis/priceSettingApi';
import { ValidationError } from '@/exceptions/PriceSettingExceptions';
import { calculateAllProductsMargins } from '@/utils/priceCalculation';

import Toast from "@/components/common/Toast";

// 기본값 상수 정의
const DEFAULT_FORMULA_SETTINGS: SellingPriceFormulaInfo = {
    freeShipping: false,
    optimizeShippingFee: true,
    baseMarginRate: 50,
    additionalMargin: 5000,
    baseShippingFee: 3000,
    returnShippingFee: 5000,
    exchangeShippingFee: 8000,
    internationalShippingFee: 4000,
    baseDiscount: 5000,
    baseDiscountUnit: '원'
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

export default function PriceSettingByItemModalContainer(props: ContainerProps) {
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
        console.log('showToastMessage 호출됨:', message);
        setToastMessage(message);
        setShowToast(true);
        console.log('Toast 상태 업데이트됨:', { message, showToast: true });
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
            
            // 1. 개별 상품별 저장된 가격 설정 데이터 먼저 확인
            const individualProductData = await Promise.all(
                props.selectedProducts.map(async (product) => {
                    try {
                        const productData = await priceSettingApi.get(product.originGoodsCode);
                        return {
                            originGoodsCode: product.originGoodsCode,
                            data: productData
                        };
                    } catch (error) {
                        console.warn(`상품 ${product.originGoodsCode}의 저장된 데이터 로드 실패:`, error);
                        return {
                            originGoodsCode: product.originGoodsCode,
                            data: null
                        };
                    }
                })
            );
            
            // console.log('📦 개별 상품별 저장된 데이터:', individualProductData);
            
            // 2. 개별 상품 데이터가 있는지 확인
            const hasIndividualData = individualProductData.some(item => item.data && item.data.success);
            
            // 3. 공통 가격 설정 정보 로드 (항상 호출)
            const savedData = await priceSettingApi.getInfo();

            // 데이터 존재 여부를 더 정확하게 검증
            const hasFormulaData = savedData && 
                savedData.sellingPriceFormulaInfo && 
                typeof savedData.sellingPriceFormulaInfo === 'object';
                
            const hasMarginData = savedData && 
                savedData.platformMarginRateInfo && 
                typeof savedData.platformMarginRateInfo === 'object';

            // 4. 데이터 복원 로직
            if (hasIndividualData) {
                // console.log('🔄 개별 상품 데이터에서 가격 설정 정보 복원 중...');
                
                // 첫 번째 유효한 개별 상품 데이터에서 가격 설정 정보 추출
                const validProductData = individualProductData.find(item => item.data && item.data.success);
                if (validProductData && validProductData.data.data) {
                    const productData = validProductData.data.data;
                    
                    // 개별 상품 데이터에서 공식 설정 복원
                    if (productData.sellingPriceFormulaInfo && typeof productData.sellingPriceFormulaInfo === 'object') {
                        const formulaInfo = productData.sellingPriceFormulaInfo;
                        setFormulaSettings(prev => ({
                            ...prev,
                            baseMarginRate: formulaInfo?.baseMarginRate || prev.baseMarginRate,
                            additionalMargin: formulaInfo?.additionalMargin || prev.additionalMargin,
                            baseShippingFee: formulaInfo?.baseShippingFee || prev.baseShippingFee,
                            returnShippingFee: formulaInfo?.returnShippingFee || prev.returnShippingFee,
                            exchangeShippingFee: formulaInfo?.exchangeShippingFee || prev.exchangeShippingFee,
                            internationalShippingFee: formulaInfo?.internationalShippingFee || prev.internationalShippingFee,
                            freeShipping: formulaInfo?.freeShipping !== undefined ? formulaInfo.freeShipping : prev.freeShipping,
                            optimizeShippingFee: formulaInfo?.optimizeShippingFee !== undefined ? formulaInfo.optimizeShippingFee : prev.optimizeShippingFee,
                            // 🆕 baseDiscount와 baseDiscountUnit에 대한 안전한 처리
                            baseDiscount: (formulaInfo && typeof formulaInfo.baseDiscount === 'number') ? formulaInfo.baseDiscount : (prev?.baseDiscount || 0),
                            baseDiscountUnit: (formulaInfo && typeof formulaInfo.baseDiscountUnit === 'string') ? formulaInfo.baseDiscountUnit : (prev?.baseDiscountUnit || '원')
                        }));
                    }
                    
                    // 개별 상품 데이터에서 플랫폼 마진율 복원
                    if (productData.platformMarginRateInfo) {
                        const marginInfo = productData.platformMarginRateInfo;
                        setPlatformMarginRates(prev => ({
                            ...prev,
                            smartstore: marginInfo.smartstore || prev.smartstore,
                            coupang: marginInfo.coupang || prev.coupang,
                            auction: marginInfo.auction || prev.auction,
                            gmarket: marginInfo.gmarket || prev.gmarket,
                            elevenst: marginInfo.elevenst || prev.elevenst,
                            openmarket: marginInfo.openmarket || prev.openmarket
                        }));
                    }
                    
                    // 개별 상품 데이터에서 환율 정보 복원
                    if (productData.exchangeRateInfo && Array.isArray(productData.exchangeRateInfo)) {
                        productData.exchangeRateInfo.forEach(exchangeRate => {
                            if (exchangeRate.currencyCode && exchangeRate.appliedRate) {
                                updateAppliedRate(exchangeRate.currencyCode, exchangeRate.appliedRate);
                            }
                        });
                    }
                }
            } else if (hasFormulaData && hasMarginData) {
                // console.log('🔄 공통 가격 설정 데이터에서 정보 복원 중...');

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
                        optimizeShippingFee: formulaInfo.optimizeShippingFee !== undefined ? formulaInfo.optimizeShippingFee : prev.optimizeShippingFee,
                        // 🆕 baseDiscount와 baseDiscountUnit에 대한 안전한 처리
                        baseDiscount: (formulaInfo && typeof formulaInfo.baseDiscount === 'number') ? formulaInfo.baseDiscount : (prev?.baseDiscount || 0),
                        baseDiscountUnit: (formulaInfo && typeof formulaInfo.baseDiscountUnit === 'string') ? formulaInfo.baseDiscountUnit : (prev?.baseDiscountUnit || '원')
                    }));
                }

                // 플랫폼 마진율 복원 (새로운 구조에 맞춰 수정)
                if (savedData.platformMarginRateInfo) {
                    const marginInfo = savedData.platformMarginRateInfo;
                    setPlatformMarginRates(prev => ({
                        ...prev,
                        smartstore: marginInfo.smartstore || prev.smartstore,
                        coupang: marginInfo.coupang || prev.coupang,
                        auction: marginInfo.auction || prev.auction,
                        gmarket: marginInfo.gmarket || prev.gmarket,
                        elevenst: marginInfo.elevenst || prev.elevenst,
                        openmarket: marginInfo.openmarket || prev.openmarket
                    }));
                }
                
                // 환율 데이터 복원
                if (savedData.exchangeRateInfo && Array.isArray(savedData.exchangeRateInfo)) {
                    savedData.exchangeRateInfo.forEach(exchangeRate => {
                        if (exchangeRate.currencyCode && exchangeRate.appliedRate) {
                            updateAppliedRate(exchangeRate.currencyCode, exchangeRate.appliedRate);
                        }
                    });
                }


            } else {
                // 3) 데이터가 없다면 기본 상수 로드
                if (import.meta.env.DEV) {
                    console.log('�� 기본 가격 설정 상수를 사용합니다.');
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

    const handleCalculateMargin = async (): Promise<void> => {
        if (props.selectedProducts.length === 0) {
            if (import.meta.env.DEV) {
                showToastMessage('선택된 상품이 없습니다.');
            }
            throw new ValidationError('선택된 상품이 없습니다.', 'selectedProducts', props.selectedProducts);
        }

        if (exchangeRates.length === 0) {
            if (import.meta.env.DEV) {
                showToastMessage('환율 데이터가 없습니다.');
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
                    totalPrice: product.total_price ? 
                        (typeof product.total_price === 'string' 
                            ? parseFloat(product.total_price) 
                            : product.total_price) 
                        : undefined,
                    exchangeRate: 1, // 기본값, 실제로는 환율 데이터에서 가져와야 함
                    baseMarginRate: formulaSettings.baseMarginRate,
                    additionalMargin: formulaSettings.additionalMargin,
                    internationalShippingFee: formulaSettings.internationalShippingFee,
                    baseDiscount: formulaSettings.baseDiscount,
                    baseDiscountUnit: formulaSettings.baseDiscountUnit
                })),
                formulaSettings.baseMarginRate,
                formulaSettings.additionalMargin,
                formulaSettings.internationalShippingFee,
                formulaSettings.baseDiscount,
                formulaSettings.baseDiscountUnit,
                platformMarginRates
            );

            setCalculatedPrices(newCalculatedPrices);
            setIsCalculated(true);
            showToastMessage?.('마진 계산이 완료되었습니다!');

        } catch (error) {
            showToastMessage?.('마진 계산 중 오류가 발생했습니다.');
            throw error;
        }
    };

    const handleSave = async (saveData: SaveData): Promise<void> => {

        if (!isCalculated || calculatedPrices.length === 0) {
            showToastMessage('계산된 데이터가 없습니다. 먼저 마진을 계산해주세요.');
            throw new ValidationError('계산된 데이터가 없습니다. 먼저 마진을 계산해주세요.', 'calculatedPrices', calculatedPrices);
        }

        const originGoodsCode = calculatedPrices[0]?.originGoodsCode;
        if (import.meta.env.DEV) {
            console.log('🎯 저장할 상품 코드:', originGoodsCode);
        }

        if (!originGoodsCode) {
            showToastMessage('계산된 상품 데이터에서 상품 코드를 찾을 수 없습니다.');
            throw new ValidationError('계산된 상품 데이터에서 상품 코드를 찾을 수 없습니다.', 'originGoodsCode', originGoodsCode);
        }

        try {
            await priceSettingApi.save(saveData);
            props.onSave(saveData);

            if (import.meta.env.DEV) {
                showToastMessage('가격 설정 저장을 완료했습니다.');
            }
        } catch (error) {
            if (import.meta.env.DEV) {
                showToastMessage('가격 설정 저장에 실패했습니다.');
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
        showToastMessage('마진 목록이 초기화되었습니다!');
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

            <PriceSettingByItemModal
                showToastMessage={showToastMessage} 
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
                    smartstore: { ExpectedMarginRate: platformMarginRates.smartstore },
                    coupang: { ExpectedMarginRate: platformMarginRates.coupang },
                    auction: { ExpectedMarginRate: platformMarginRates.auction },
                    gmarket: { ExpectedMarginRate: platformMarginRates.gmarket },
                    elevenst: { ExpectedMarginRate: platformMarginRates.elevenst },
                    openmarket: { ExpectedMarginRate: platformMarginRates.openmarket }
                } as PlatformMarginRates}
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


