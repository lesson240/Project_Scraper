// src/types/priceSetting.types.ts

export interface Product {
    id: string;
    name: string;
    thumbnail: string;
    originalPrice: number | string;
    currency: string;
    tags: string[];
}

export interface ExchangeRateData {
    currency: string;
    dailyRate: number;
    weeklyTariff: number;
    appliedRate: number | string;
    lastUpdated?: Date;
    source?: 'customs' | 'koreaexim' | 'manual';
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
