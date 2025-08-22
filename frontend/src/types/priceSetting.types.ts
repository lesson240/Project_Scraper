// src/types/priceSetting.types.ts

export interface Product {
    id: string;
    name: string;
    thumbnail: string;
    originalPrice: number | string;
    currency: string;
    tags: string[];
}

// 기존 ExchangeRateData 인터페이스 수정
export interface ExchangeRateData {
    currencyCode: string;
    baseDate: string;  // number → string으로 변경 (YYYYMMDD 형식)
    rateType: string;  // number → string으로 변경 ('daily' | 'weekly')
    appliedRate: number;
    lastUpdated?: Date;
    source?: 'customs' | 'koreaexim' | 'manual';
}

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
}
