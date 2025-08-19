// path: frontend/src/components/productUpload/modals/PriceSettingModal/types/priceSetting.types.ts

export interface ExchangeRate {
    currency: string;
    dailyRate: number;
    weeklyTariff: number;
    appliedRate: number | string;
}

export interface FormulaSettings {
    baseMarginRate: number;
    additionalMargin: number;
    baseShippingFee: number;
    returnShippingFee: number;
    exchangeShippingFee: number;
    freeShipping: boolean;
    optimizeShippingFee: boolean;
}

export interface PlatformMargins {
    coupang: number;
    auction: number;
    gmarket: number;
    elevenst: number;
}

export interface SelectedProduct {
    id: string;
    name: string;
    thumbnail: string;
    originalPrice: string;
    cost: number;
    currency: string;
}

export interface CalculatedPrice {
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
}

export interface PriceSettings {
    formula: FormulaSettings;
    platformMargins: PlatformMargins;
    exchangeRates: ExchangeRate[];
}

export interface PriceSettingModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedProducts: SelectedProduct[];
    onSave: (settings: PriceSettings) => void;
}

export interface ExchangeRateSectionProps {
    exchangeRates: ExchangeRate[];
    isLoading: boolean;
}

export interface FormulaSectionProps {
    formulaSettings: FormulaSettings;
    platformMargins: PlatformMargins;
    onFormulaChange: (field: string, value: number | boolean) => void;
    onPlatformMarginChange: (platform: string, value: number) => void;
}

export interface MarginListSectionProps {
    selectedProducts: SelectedProduct[];
    calculatedPrices: CalculatedPrice[];
    exchangeRates: ExchangeRate[];
}
