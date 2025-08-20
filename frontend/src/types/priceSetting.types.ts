// src/types/priceSetting.types.ts

export interface Product {
    id: string;
    name: string;
    thumbnail: string;
    price: number;
    tags: string[];
}

export interface FormulaSettings {
    basePrice: number;
    exchangeRate: number;
    platformMargin: {
        [key: string]: number;
    };
    isEnabled: boolean;
}

export interface ExchangeRateData {
    currency: string;
    dailyRate: number;
    weeklyTariff: number;
    appliedRate: number;
}

export interface CalculatedPrice {
    productId: string;
    originalPrice: number;
    setPrice: number;
    marginRate: number;
    marginAmount: number;
}

export interface PriceSettingModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedProducts: any[];
    onSave: (settings: any) => void;
}

export interface PriceSettingModalUIProps {
    isOpen: boolean;
    onClose: () => void;
    selectedProducts: any[];
    formulaSettings: FormulaSettings;
    platformMargins: { [key: string]: number };
    exchangeRates: ExchangeRateData[];
    calculatedPrices: CalculatedPrice[];
    isCalculated: boolean;
    tariffPeriod: string;
    isLoading: boolean;
    error: string | null;
    isExchangeRateExpanded: boolean;
    isFormulaExpanded: boolean;
    onFormulaChange: (field: string, value: number | boolean) => void;
    onPlatformMarginChange: (platform: string, value: number) => void;
    onCalculateMargin: () => void;
    onSave: () => void;
    onReset: () => void;
    onExchangeRateToggle: () => void;
    onFormulaToggle: () => void;
    onAppliedRateChange: (currency: string, rate: number) => void;
    onSyncRates: () => void;
}

export interface ExchangeRateSectionProps {
    exchangeRates: ExchangeRateData[];
    tariffPeriod: string;
    isLoading: boolean;
    error: string | null;
    onAppliedRateChange: (currency: string, rate: number) => void;
    onSyncRates: () => void;
}

export interface FormulaSectionProps {
    formulaSettings: FormulaSettings;
    platformMargins: { [key: string]: number };
    onFormulaChange: (field: string, value: number | boolean) => void;
    onPlatformMarginChange: (platform: string, value: number) => void;
}

export interface MarginListSectionProps {
    calculatedPrices: CalculatedPrice[];
    isCalculated: boolean;
}
