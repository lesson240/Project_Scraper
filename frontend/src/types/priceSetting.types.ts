// src/types/priceSetting.types.ts

export interface Product {
    id: string;
    name: string;
    thumbnail: string;
    originalPrice: number | string;
    currency: string;
    tags: string[];
    originGoodsCode?: string; // 상품 원본 코드 추가
    goods_origin?: string | number; // 원본 할인가 (goods_origin 필드)
    cost?: number | string; // 원가
    price?: number | string; // 가격
    selling_price?: number | string; // 판매가
}

// 기존 ExchangeRateData 인터페이스 수정
export interface ExchangeRateData {
    currencyCode: string;
    appliedRate: number;
    lastUpdated: string; // 간단한 날짜 문자열 (YYYY-MM-DD)
    source: 'customs' | 'koreaexim' | 'manual';
    // 🆕 customs와 koreaexim 데이터 추가
    customs?: {
        appliedRate: number;
        baseDate: string;
        aplyBgnDt: string;
        originalData: any;
        isActive: boolean;
        source: string;
    } | null;
    koreaexim?: {
        appliedRate: number;
        baseDate: string;
        searchdate: string;
        tts: number;
        ttb: number;
        isActive: boolean;
        source: string;
    } | null;
}

// 원화 처리 헬퍼 함수 추가
export const createExchangeRateData = (
    currencyCode: string | undefined, 
    appliedRate: number | undefined, 
    source: 'customs' | 'koreaexim' | 'manual' = 'manual'
): ExchangeRateData => {
    // undefined 값 처리: 기본값 설정
    const finalCurrencyCode = currencyCode || 'KRW';
    const finalAppliedRate = appliedRate || 1.0; // 기본 환율 1.0
    
    // 날짜 형식 보장: YYYY-MM-DD
    const today = new Date().toISOString().slice(0, 10);
    
    return {
        currencyCode: finalCurrencyCode,
        appliedRate: finalAppliedRate,
        lastUpdated: today, // YYYY-MM-DD 형식 보장
        source: source
    };
};

// Combined 엔드포인트 응답용 인터페이스 추가
export interface CombinedExchangeRateData {
    currencyCode: string;
    customs: {
        appliedRate: number;
        baseDate: string;
        aplyBgnDt: string;
        originalData: any;
        isActive: boolean;
        source: string;
    } | null;
    koreaexim: {
        appliedRate: number;
        baseDate: string;
        searchdate: string;
        tts: number;
        ttb: number;
        isActive: boolean;
        source: string;
    } | null;
}

// Combined 응답 인터페이스
export interface CombinedExchangeRateResponse {
    success: boolean;
    data: CombinedExchangeRateData[];
    message: string;
}

// SaveData 인터페이스 추가
export interface SaveData {
    exchangeRates: Array<{ currency: string; value: number }>;
    formulaSettings: {
        baseMarginRate: number;
        additionalMargin: number;
        baseShippingFee: number;
        returnShippingFee: number;
        exchangeShippingFee: number;
        freeShipping: boolean;
        optimizeShippingFee: boolean;
    };
    platformMargins: {
        coupang: number;
        auction: number;
        gmarket: number;
        elevenst: number;
    };
    calculatedProducts: Array<{
        productId: string;
        basePrice: number;
        platformPrices: {
            coupang: number;
            auction: number;
            gmarket: number;
            elevenst: number;
        };
        expectedMargin: number;
        expectedMarginRate: number;
    }>;
    originGoodsCode: string;
}

export interface PriceSettingModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedProducts: any[];
    onSave?: (settings: any) => void;
}

export interface PriceSettingModalUIProps {
    isOpen: boolean;
    onClose: () => void;
    selectedProducts: any[];
    exchangeRates: ExchangeRateData[];
    calculatedPrices: CalculatedPrice[];
    isCalculated: boolean;
    tariffPeriod: string;
    isLoading: boolean;
    error: string | null;
    onAppliedRateChange: (currency: string, rate: number) => void;
    onSyncRates: () => void;
    formulaSettings: FormulaSettings;
    platformMargins: PlatformMargins;
    onFormulaChange: (field: string, value: any) => void;
    onFormulaReset: () => void;
    onMarginChange: (platform: string, value: number) => void;
    onMarginReset: () => void;
    onPlatformMarginChange: (platform: string, value: number) => void;
    // 토글 상태 및 이벤트 핸들러 추가
    isExchangeRateExpanded: boolean;
    isFormulaExpanded: boolean;
    onExchangeRateToggle: () => void;
    onFormulaToggle: () => void;
    onCalculateMargin: () => void;
    onSave: (saveData: SaveData) => void;
    onReset: () => void;
}

export interface ExchangeRateSectionProps {
    exchangeRates: ExchangeRateData[];
    tariffPeriod: string;
    isLoading: boolean;
    error: string | null;
    onAppliedRateChange: (currency: string, rate: number) => void;
    onSyncRates: () => void;
}

export interface FormulaSettings {
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
}

export interface PlatformMargins {
    coupang: number;
    elevenst: number;
    gmarket: number;
    openmarket: number;
    auction: number;
}

export interface CalculatedPrice {
    productId: string;
    currency: string;
    originalPrice: number;
    calculatedPrice: number;
    margin: number;
    finalPrice: number;
    basePrice: number;
    platformPrices: {
        coupang: number;
        auction: number;
        gmarket: number;
        elevenst: number;
    };
    expectedMargin: number;
    expectedMarginRate: number;
}

export interface CalculatedProduct {
    productId: string;
    basePrice: number;
    platformPrices: Record<string, number>;
    expectedMargin: number;
    expectedMarginRate: number;
    exchangeRate: number;
    originalPrice: number;
}
  
  export interface ProductPriceData {
    originGoodsCode: string;
    settingPrice: number;
    // 🆕 추가 필드들
    expectedMargin?: number;
    expectedMarginRate?: number;
    salesPrice?: number;
}

export interface PriceSettingRequest {
    exchangeRates: ExchangeRateData[];
    formulaSettings: FormulaSettings;
    platformMargins: PlatformMargins;
    calculatedProducts: Record<string, any>[]; // 백엔드 모델과 일치
    updatedProducts?: ProductPriceData[]; // 백엔드 모델과 일치 (선택적)
    originGoodsCode: string;
    
    // 🆕 통합된 필드들 (base_price_setting 컬렉션용)
    // allttamExchangeRates 제거 - manuel로 통합
    baseSellingPriceFormula?: Record<string, any>; // 기본 판매가 공식
    additionalSellingPriceFormula?: Record<string, any>; // 추가 판매가 공식
}

export interface FormulaSectionProps {
    formulaSettings: FormulaSettings;
    platformMargins: PlatformMargins;
    onFormulaChange: (field: string, value: any) => void;
    onPlatformMarginChange: (platform: string, value: number) => void;
}

export interface MarginListSectionProps {
    selectedProducts: Product[];
    calculatedPrices: CalculatedPrice[];
    exchangeRates: ExchangeRateData[];
    platformMargins: PlatformMargins;
    onMarginChange: (platform: string, value: number) => void;
    onMarginReset: () => void;
    isCalculated?: boolean;
}
