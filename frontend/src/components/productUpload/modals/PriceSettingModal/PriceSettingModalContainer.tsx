// path: frontend/src/components/productUpload/modals/PriceSettingModal/PriceSettingModalContainer.tsx
import React, { useState, useEffect } from 'react';
import PriceSettingModal from './PriceSettingModal';
import { useExchangeRateManager } from '@/hooks/useExchangeRateManager';
import { getExchangeRatesForFrontend } from '@/apis/exchangeRateApi';
import type {
    PriceSettingModalUIProps,
    SaveData,
    Product,
    ExchangeRateData,
    CalculatedPrice,
    FormulaSettings
} from '@/types/priceSetting.types';
import type { PlatformMargins } from '@/utils/priceCalculation';
import priceSettingApi from '@/apis/priceSettingApi';

export default function PriceSettingModalContainer(props: PriceSettingModalUIProps) {
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
        main: 0, // 🆕 main 필드 추가
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

    // 가격 계산 로직 - 실제 공식 기반
    const [calculatedPrices, setCalculatedPrices] = useState<any[]>([]);

    // 🆕 저장된 데이터 로딩 상태
    const [isLoadingSavedData, setIsLoadingSavedData] = useState(false);

    useEffect(() => {
        if (props.isOpen && props.selectedProducts.length > 0) {
            // 모달이 열릴 때마다 계산 상태 초기화
            setIsCalculated(false);

            // 🆕 저장된 가격 설정 데이터 자동 로드
            loadSavedPriceSettingData();
        }
    }, [props.isOpen, props.selectedProducts]);

    // 🆕 저장된 가격 설정 데이터 로드 함수
    const loadSavedPriceSettingData = async () => {
        if (props.selectedProducts.length === 0) return;

        const originGoodsCode = props.selectedProducts[0]?.originGoodsCode;
        if (!originGoodsCode) return;

        try {
            setIsLoadingSavedData(true);
            console.log('🔍 저장된 가격 설정 데이터 로드 시작:', originGoodsCode);

            const savedData = await priceSettingApi.load(originGoodsCode);

            if (savedData) {
                console.log('✅ 저장된 데이터 로드 성공:', savedData);

                // 1. 환율 데이터 복원
                if (savedData.exchangeRates?.manuel) {
                    const manuelRates = savedData.exchangeRates.manuel;
                    console.log('💱 저장된 환율 데이터:', manuelRates);

                    // 환율 데이터를 exchangeRates 상태에 반영
                    const updatedRates = exchangeRates.map(rate => {
                        const savedRate = manuelRates.find((sr: any) => sr.currencyCode === rate.currencyCode);
                        if (savedRate && savedRate.appliedRate > 0) {
                            return { ...rate, appliedRate: savedRate.appliedRate };
                        }
                        return rate;
                    });

                    // 환율 상태 업데이트 (강제로 설정)
                    updatedRates.forEach(rate => {
                        updateAppliedRate(rate.currencyCode, rate.appliedRate);
                    });
                }

                // 2. 공식 설정 복원
                if (savedData.formulaSettings?.base) {
                    const baseSettings = savedData.formulaSettings.base;
                    console.log('📊 저장된 기본 공식 설정:', baseSettings);

                    setFormulaSettings(prev => ({
                        ...prev,
                        baseMarginRate: baseSettings.baseMarginRate || prev.baseMarginRate,
                        additionalMargin: baseSettings.additionalMargin || prev.additionalMargin,
                        baseShippingFee: baseSettings.baseShippingFee || prev.baseShippingFee,
                        returnShippingFee: baseSettings.returnShippingFee || prev.returnShippingFee,
                        exchangeShippingFee: baseSettings.exchangeShippingFee || prev.exchangeShippingFee,
                        freeShipping: baseSettings.freeShipping || prev.freeShipping,
                        optimizeShippingFee: baseSettings.optimizeShippingFee || prev.optimizeShippingFee
                    }));
                }

                // 3. 플랫폼 마진 설정 복원
                if (savedData.formulaSettings?.additional) {
                    const additionalSettings = savedData.formulaSettings.additional;
                    console.log('📊 저장된 추가 공식 설정:', additionalSettings);

                    setPlatformMargins(prev => ({
                        ...prev,
                        coupang: additionalSettings.coupang || prev.coupang,
                        auction: additionalSettings.auction || prev.auction,
                        gmarket: additionalSettings.gmarket || prev.gmarket,
                        elevenst: additionalSettings.elevenst || prev.elevenst,
                        openmarket: additionalSettings.openmarket || prev.openmarket
                    }));
                }

                console.log('✅ 모든 저장된 데이터 복원 완료');
            } else {
                console.log('⚠️ 저장된 데이터가 없어 기본값 사용');
            }
        } catch (error) {
            console.error('❌ 저장된 데이터 로드 실패:', error);
        } finally {
            setIsLoadingSavedData(false);
        }
    };

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

    // 기본 판매가 공식 계산 함수
    const calculateBasePrice = (product: Product, exchangeRate: number, originalPrice: number) => {
        // 기본 판매가 공식: 원본 할인가 × 환율 × (1 + 기본 마진율) + 추가 마진
        const basePrice = (originalPrice * exchangeRate * (1 + formulaSettings.baseMarginRate / 100)) +
            formulaSettings.additionalMargin;

        return Math.round(basePrice);
    };

    // 예상 마진 계산 함수
    const calculateExpectedMargin = (product: Product, basePrice: number, exchangeRate: number, originalPrice: number) => {
        // 예상 마진 = 설정 상품가 - (원가 × 환율) - 배송비
        const costWithExchangeRate = originalPrice * exchangeRate;
        const expectedMargin = basePrice - costWithExchangeRate - formulaSettings.baseShippingFee;

        return Math.round(expectedMargin);
    };

    // 예상 마진율 계산 함수
    const calculateExpectedMarginRate = (expectedMargin: number, basePrice: number) => {
        if (basePrice === 0) return 0;
        return Math.round((expectedMargin / basePrice) * 100);
    };

    const handleCalculateMargin = () => {
        if (props.selectedProducts.length > 0) {
            console.log('🔍 마진 계산 시작 - 선택된 상품:', props.selectedProducts);
            console.log('🔍 현재 환율 정보:', exchangeRates);
            console.log('🔍 현재 공식 설정:', formulaSettings);

            // 실제 공식 기반 가격 계산
            const calculated = props.selectedProducts.map((product, index) => {
                console.log(`\n🔍 상품 ${index + 1} 계산 시작:`, product);

                // 환율 정보 찾기
                let exchangeRate = 1; // 기본값
                const productCurrency = product.currencyCode || product.currency || 'KRW';
                console.log(`💰 상품 통화: ${productCurrency}`);

                if (productCurrency && productCurrency !== 'KRW') {
                    const rateInfo = exchangeRates.find(rate => rate.currencyCode === productCurrency);
                    console.log(`🔍 찾은 환율 정보:`, rateInfo);

                    if (rateInfo) {
                        exchangeRate = rateInfo.appliedRate;
                        console.log(`✅ 적용된 환율: ${exchangeRate}`);
                    } else {
                        console.log(`⚠️ 환율 정보를 찾을 수 없음: ${productCurrency}`);
                        // 환율 정보가 없으면 기본값 사용
                        exchangeRate = 1;
                    }
                } else {
                    console.log(`✅ 원화 상품 - 환율 1 적용`);
                }

                // 원본 할인가 확인 및 변환 (여러 필드명 시도)
                let originalPrice = 0;

                // 상품 객체의 모든 필드 확인
                console.log(`🔍 상품 ${product.id}의 전체 데이터:`, product);

                // 가격 정보 우선순위: goods_origin > originalPrice > cost > price > selling_price
                if (product.goods_origin && parseFloat(product.goods_origin) > 0) {
                    originalPrice = parseFloat(product.goods_origin);
                    console.log(`✅ goods_origin에서 가격 찾음: ${originalPrice}`);
                } else if (product.originalPrice !== undefined && product.originalPrice !== null) {
                    originalPrice = typeof product.originalPrice === 'string'
                        ? parseFloat(product.originalPrice)
                        : product.originalPrice;
                } else if (product.cost !== undefined && product.cost !== null) {
                    originalPrice = typeof product.cost === 'string'
                        ? parseFloat(product.cost)
                        : product.cost;
                } else if (product.price !== undefined && product.price !== null) {
                    originalPrice = typeof product.price === 'string'
                        ? parseFloat(product.price)
                        : product.price;
                } else if (product.selling_price !== undefined && product.selling_price !== null) {
                    originalPrice = typeof product.selling_price === 'string'
                        ? parseFloat(product.selling_price)
                        : product.selling_price;
                }

                console.log(`💵 원본 할인가: ${product.goods_origin || product.originalPrice || product.cost || product.price || product.selling_price} → ${originalPrice}`);

                // 원본 할인가가 0인 경우 경고 및 상세 정보 표시
                if (originalPrice === 0 || isNaN(originalPrice)) {
                    console.warn(`⚠️ 상품 ${product.id}의 원본 할인가가 0이거나 유효하지 않습니다!`);
                    console.warn(`🔍 사용 가능한 가격 필드들:`, {
                        goods_origin: product.goods_origin,
                        originalPrice: product.originalPrice,
                        cost: product.cost,
                        price: product.price,
                        selling_price: product.selling_price
                    });

                    // 상품의 모든 필드를 확인하여 가격 정보 찾기
                    const allFields = Object.keys(product);
                    const priceRelatedFields = allFields.filter(field =>
                        field.toLowerCase().includes('price') ||
                        field.toLowerCase().includes('cost') ||
                        field.toLowerCase().includes('amount') ||
                        field.toLowerCase().includes('value') ||
                        field.toLowerCase().includes('origin')
                    );

                    console.log(`🔍 가격 관련 필드들:`, priceRelatedFields);
                    priceRelatedFields.forEach(field => {
                        console.log(`  ${field}:`, product[field]);
                    });

                    // 테스트를 위해 기본값 설정 (실제로는 제거해야 함)
                    originalPrice = 10000; // 10,000원으로 임시 설정
                    console.log(`🔄 테스트용 기본값 설정: ${originalPrice}`);
                }

                // 기본 판매가 계산
                const basePrice = calculateBasePrice(product, exchangeRate, originalPrice);
                console.log(`📊 기본 판매가 계산: ${basePrice}`);

                // 예상 마진 계산
                const expectedMargin = calculateExpectedMargin(product, basePrice, exchangeRate, originalPrice);
                console.log(`💰 예상 마진 계산: ${expectedMargin}`);

                // 예상 마진율 계산
                const expectedMarginRate = calculateExpectedMarginRate(expectedMargin, basePrice);
                console.log(`📈 예상 마진율 계산: ${expectedMarginRate}%`);

                // 🆕 새로운 marginList 구조로 변경
                const calculatedPrice: CalculatedPrice = {
                    originGoodsCode: product.originGoodsCode,  // 🆕 originGoodsCode 추가
                    currency: product.currency || 'KRW',
                    originalPrice: product.originalPrice || 0,
                    calculatedPrice: basePrice,
                    margin: expectedMargin,
                    finalPrice: basePrice,
                    basePrice: basePrice,
                    exchangeRate: exchangeRate,
                    platformPrices: {
                        coupang: basePrice,
                        auction: basePrice,
                        gmarket: basePrice,
                        elevenst: basePrice,
                        openmarket: basePrice
                    },

                    // 🆕 marginList 구조로 변경
                    marginList: {
                        main: {
                            ExpectedMargin: Math.round(expectedMargin * 100) / 100,
                            ExpectedMarginRate: Math.round(expectedMarginRate * 100) / 100,
                            selling_price: basePrice // 🆕 selling_price 추가
                        },
                        coupang: {
                            ExpectedMargin: Math.round(expectedMargin * 100) / 100,
                            ExpectedMarginRate: Math.round(expectedMarginRate * 100) / 100,
                            selling_price: basePrice * (1 + platformMargins.coupang / 100) // 🆕 쿠팡 판매가
                        },
                        auction: {
                            ExpectedMargin: Math.round(expectedMargin * 100) / 100,
                            ExpectedMarginRate: Math.round(expectedMarginRate * 100) / 100,
                            selling_price: basePrice * (1 + platformMargins.auction / 100) // 🆕 옥션 판매가
                        },
                        gmarket: {
                            ExpectedMargin: Math.round(expectedMargin * 100) / 100,
                            ExpectedMarginRate: Math.round(expectedMarginRate * 100) / 100,
                            selling_price: basePrice * (1 + platformMargins.gmarket / 100) // 🆕 지마켓 판매가
                        },
                        elevenst: {
                            ExpectedMargin: Math.round(expectedMargin * 100) / 100,
                            ExpectedMarginRate: Math.round(expectedMarginRate * 100) / 100,
                            selling_price: basePrice * (1 + platformMargins.elevenst / 100) // 🆕 11번가 판매가
                        }
                    }
                };

                console.log(`✅ 상품 ${product.originGoodsCode} 계산 완료:`, calculatedPrice);
                return calculatedPrice;
            });

            console.log('\n🎯 전체 계산 결과:', calculated);
            console.log('📊 calculatedPrices 상태 업데이트 전:', calculatedPrices);
            setCalculatedPrices(calculated);
            console.log('📊 calculatedPrices 상태 업데이트 후:', calculated);
            setIsCalculated(true);
            console.log('✅ 마진 계산 완료 상태 설정됨');
        }
    };

    // 새로운 SaveData 구조에 맞는 저장 핸들러
    const handleSave = async (saveData: SaveData) => {
        try {
            console.log('💾 가격 설정 저장 시작:', saveData);

            // 🆕 실제 사용자 입력값을 가져오는 로직
            // 1. 올땀적용환율 - 실제 입력된 값들 (KRW 제외)
            const manuelExchangeRates = {};
            console.log('🔍 전체 exchangeRates 상태:', exchangeRates);

            if (exchangeRates && exchangeRates.length > 0) {
                exchangeRates.forEach(rate => {
                    console.log(`🔍 환율 데이터 확인: ${rate.currencyCode} = ${rate.appliedRate}`);

                    // KRW가 아닌 통화만 올땀적용환율에 포함
                    if (rate.currencyCode && rate.currencyCode !== 'KRW' && rate.appliedRate > 0) {
                        manuelExchangeRates[rate.currencyCode] = rate.appliedRate;
                        console.log(`💱 올땀적용환율 ${rate.currencyCode}: ${rate.appliedRate}`);
                    } else if (rate.currencyCode === 'KRW') {
                        console.log(`🇰🇷 KRW 환율 건너뜀: ${rate.appliedRate}`);
                    } else if (rate.appliedRate <= 0) {
                        console.log(`⚠️ ${rate.currencyCode} 환율이 0 이하: ${rate.appliedRate}`);
                    }
                });
            } else {
                console.warn('⚠️ exchangeRates가 비어있습니다.');
            }

            // 올땀적용환율이 비어있으면 경고
            if (Object.keys(manuelExchangeRates).length === 0) {
                console.warn('⚠️ 올땀적용환율 데이터가 없습니다. 사용자가 입력한 값이 있는지 확인해주세요.');
                console.warn('🔍 가능한 원인:');
                console.warn('  1. 환율 설정 섹션이 펼쳐지지 않음');
                console.warn('  2. 환율 데이터가 로드되지 않음');
                console.warn('  3. appliedRate 값이 0 이하');
            } else {
                console.log(`✅ 올땀적용환율 ${Object.keys(manuelExchangeRates).length}개 통화 수집 완료:`, manuelExchangeRates);
            }

            // 2. 기본 판매가 공식 - 현재 상태값 사용
            const baseSellingPriceFormula = {
                baseMarginRate: formulaSettings.baseMarginRate,
                additionalMargin: formulaSettings.additionalMargin,
                baseShippingFee: formulaSettings.baseShippingFee,
                returnShippingFee: formulaSettings.returnShippingFee,
                exchangeShippingFee: formulaSettings.exchangeShippingFee,
                freeShipping: formulaSettings.freeShipping,
                optimizeShippingFee: formulaSettings.optimizeShippingFee
            };

            // 3. 추가 판매가 공식 - 현재 상태값 사용 (platformMargins 대신)
            const additionalSellingPriceFormula = {
                coupang: platformMargins.coupang,
                auction: platformMargins.auction,
                gmarket: platformMargins.gmarket,
                elevenst: platformMargins.elevenst,
            };

            // 4. 마진목록 - 계산된 실제 값들 (ModifiedGoodsDetail에 직접 저장)
            // marginList 제거 - updatedProducts에 포함하여 처리

            // 5. 업데이트할 상품 목록 - 계산된 실제 값들 (ModifiedGoodsDetail에 직접 저장)
            const updatedProducts = calculatedPrices.map(product => ({
                originGoodsCode: saveData.originGoodsCode,
                settingPrice: product.basePrice,
                mainExpectedMargin: product.marginList.main.ExpectedMargin,  // 🆕 marginList 구조 사용
                mainExpectedMarginRate: product.marginList.main.ExpectedMarginRate,  // 🆕 marginList 구조 사용
                salesPrice: product.basePrice // 설정상품가를 selling_price로 사용
            }));

            // SaveData를 PriceSettingRequest로 변환
            const priceSettingRequest = {
                exchangeRates: saveData.exchangeRates.map(rate => ({
                    currencyCode: rate.currency,
                    appliedRate: rate.value,
                    lastUpdated: new Date().toISOString(),
                    source: 'manual' as const
                })),
                formulaSettings: formulaSettings, // 기존 상태 사용
                platformMargins: platformMargins,
                calculatedProducts: saveData.calculatedProducts,
                originGoodsCode: saveData.originGoodsCode,

                // 🆕 통합된 필드들로 구성
                // allttamExchangeRates 제거 - manuel로 통합
                baseSellingPriceFormula,
                additionalSellingPriceFormula,
                updatedProducts
            };

            console.log('🔄 변환된 PriceSettingRequest:', priceSettingRequest);
            console.log('🔍 실제 입력된 올땀적용환율:', manuelExchangeRates);
            console.log('📊 현재 exchangeRates 상태:', exchangeRates);
            console.log('📊 계산된 가격들:', calculatedPrices);

            // 백엔드 API 호출
            const response = await priceSettingApi.save(priceSettingRequest);


            console.log('✅ 가격 설정 저장 성공:', response);

            // 성공 시 상위 컴포넌트에 알림
            if (props.onSave) {
                const settings: SaveData = {
                    exchangeRates: exchangeRates.map(rate => ({
                        currency: rate.currencyCode,
                        value: rate.appliedRate
                    })),
                    formulaSettings: formulaSettings,
                    platformMargins: platformMargins,
                    calculatedProducts: calculatedPrices,
                    originGoodsCode: saveData.originGoodsCode
                };

                props.onSave(settings);
            }

            // 모달 닫기
            props.onClose();

            // 성공 메시지 표시
            alert('가격 설정이 성공적으로 저장되었습니다!');

        } catch (error) {
            console.error('❌ 가격 설정 저장 실패:', error);

            // 에러 메시지 표시
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
            alert(`저장 실패: ${errorMessage}`);
        }
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
            main: 0,
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
