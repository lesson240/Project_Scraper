// path: frontend/src/types/priceSetting.types.ts
import type { PlatformMargins } from '@/utils/priceCalculation';

export interface Product {
    id: string;
    name: string;
    thumbnail: string;
    originalPrice: number | string;
    currency: string;
    tags?: string[];
    originGoodsCode: string;
    goods_origin?: string | number;
    cost?: number | string;
    price?: string | number;
    selling_price?: string | number;
}

export interface ExchangeRateData {
    currencyCode: string;
    appliedRate: number;
    lastUpdated: string;
    source: 'customs' | 'koreaexim' | 'manual';
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

export interface CombinedExchangeRateResponse {
    success: boolean;
    data: CombinedExchangeRateData[];
    message: string;
}

export interface PlatformMarginInfo {
    ExpectedMargin: number;
    ExpectedMarginRate: number;
    selling_price: number;
}

export interface ProductPriceData {
    originGoodsCode: string;
    settingPrice: number;
    smartstoreExpectedMargin?: number;
    smartstoreExpectedMarginRate?: number;
    salesPrice?: number;
}

export interface CalculatedProductData {
    originGoodsCode: string;
    basePrice: number;
    originalPrice: number;
    exchangeRate: number;
    marginList: Record<string, PlatformMarginInfo>;
}

// 🆕 백엔드 모델과 일치하는 새로운 타입들
export interface ExchangeRateInfo {
    currencyCode: string;
    appliedRate: number;
    lastUpdated: string;
    source: string;
}

export interface SellingPriceFormulaInfo {
    baseMarginRate: number;
    additionalMargin: number;
    baseShippingFee: number;
    returnShippingFee: number;
    exchangeShippingFee: number;
    internationalShippingFee: number;
    freeShipping: boolean;
    optimizeShippingFee: boolean;
}

export interface PlatformMarginRateInfo {
    smartstore: number;
    coupang: number;
    auction: number;
    gmarket: number;
    elevenst: number;
    openmarket: number;
}

export interface CalculatedItemInfo {
    ExpectedMargin: number;
    ExpectedMarginRate: number;
    selling_price: number;
}

export interface PlatformMargins {
    smartstore: CalculatedItemInfo;
    coupang: CalculatedItemInfo;
    auction: CalculatedItemInfo;
    gmarket: CalculatedItemInfo;
    elevenst: CalculatedItemInfo;
    openmarket: CalculatedItemInfo;
}

export interface MarginListByItems {
    items: Record<string, PlatformMargins>;
}

// 🆕 새로운 PriceSettingRequest 타입
export interface PriceSettingRequest {
    exchangeRatesInfo: ExchangeRateInfo[];
    sellingPriceFormulaInfo: SellingPriceFormulaInfo;
    platformMarginRateInfo: PlatformMarginRateInfo;
    marginListByItems: MarginListByItems;
}

export interface PriceSettingResponse {
    success: boolean;
    message: string;
    updated_products_count: number;
    timestamp: string;
}

export interface SaveData {
    exchangeRates: Array<{
        currency: string;
        value: number;
    }>;
    formulaSettings: {
        baseMarginRate: number;
        additionalMargin: number;
        baseShippingFee: number;
        returnShippingFee: number;
        exchangeShippingFee: number;
        internationalShippingFee: number;
        freeShipping: boolean;
        optimizeShippingFee: boolean;
    };
    calculatedProducts: Array<{
        originGoodsCode: string;
        basePrice: number;
        originalPrice: number;
        exchangeRate: number;
        marginList: Record<string, PlatformMarginInfo>;
    }>;
    originGoodsCode: string;
    platformMarginRateInfo: PlatformMarginRateInfo;
}

export interface FormulaSettings {
    baseMarginRate: number;
    additionalMargin: number;
    baseShippingFee: number;
    returnShippingFee: number;
    exchangeShippingFee: number;
    internationalShippingFee: number;
    freeShipping: boolean;
    optimizeShippingFee: boolean;
}

export interface PriceSettingModalUIProps {
    isOpen: boolean;
    onClose: () => void;
    selectedProducts: Product[];
    exchangeRates: ExchangeRateData[];
    calculatedPrices: CalculatedProductData[];
    isCalculated: boolean;
    tariffPeriod: string;
    isLoading: boolean;
    error: string | null;
    formulaSettings: FormulaSettings;
    platformMargins: PlatformMargins;
    isExchangeRateExpanded: boolean;
    isFormulaExpanded: boolean;
    onAppliedRateChange: (currency: string, value: number) => void;
    onSyncRates: () => void;
    onFormulaChange: (field: keyof FormulaSettings, value: any) => void;
    onFormulaReset: () => void;
    onMarginChange: (platform: string, value: number) => void;
    onMarginReset: () => void;
    onPlatformMarginChange: (platform: keyof PlatformMargins, value: number) => void;
    onExchangeRateToggle: () => void;
    onFormulaToggle: () => void;
    onCalculateMargin: () => void;
    onSave: (saveData: SaveData) => void;
    onReset: () => void;
}

export interface MarginListSectionProps {
    selectedProducts: Product[];
    calculatedPrices: CalculatedProductData[];
    exchangeRates: ExchangeRateData[];
    platformMargins: PlatformMargins;
    onMarginChange: (productId: string, platform: string, value: number) => void;
    onMarginReset: (productId: string) => void;
    isCalculated: boolean;
}

export interface ExchangeRateSectionProps {
    exchangeRates: ExchangeRateData[];
    isLoading: boolean;
    tariffPeriod: string;
    error: string | null;
    onAppliedRateChange: (currency: string, value: number) => void;
    onSyncRates: () => void;
}

export interface FormulaSectionProps {
    formulaSettings: FormulaSettings;
    platformMargins: PlatformMargins;
    onFormulaChange: (field: keyof FormulaSettings, value: any) => void;
    onPlatformMarginChange: (platform: keyof PlatformMargins, value: number) => void;
}

export interface PriceSettingModalFooterProps {
    onSave: (saveData: SaveData) => void;
    onReset: () => void;
    onCalculateMargin: () => void;
    originGoodsCode: string;
    isCalculated: boolean;
    exchangeRates: Array<{ currency: string; value: number }>;
    formulaSettings: FormulaSettings;
    platformMargins: PlatformMargins;
    calculatedProducts: CalculatedProductData[];
}

export type ExchangeRate = ExchangeRateData;
export type SelectedProduct = Product;
