
// 🆕 1. 수동 환율 정보 모델
export interface ExchangeRateInfo {
    currencyCode: string;
    appliedRate: number;
    lastUpdated: string;
    source: string;
}

//  🆕 2. 판매가 공식 정보 모델 (SellingPriceFormulaInfo)
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

//  🆕 3. 플랫폼별 마진율 모델 (PlatformMarginRateInfo)
export interface PlatformMarginRateInfo {
    smartstore: number;
    coupang: number;
    auction: number;
    gmarket: number;
    elevenst: number;
    openmarket: number;
}

//  🆕 4. 계산된 상품 모델 (CalculatedProductData)
export interface CalculatedProductData {
    originGoodsCode: string;
    originalPrice: number;
    exchangeRate: number;
    marginList: Record<string, CalculatedItemInfo>;
}

//  🆕 5. 플랫폼별 계산된 마진 정보 모델 (CalculatedItemInfo)
export interface CalculatedItemInfo {
    ExpectedMargin: number;
    ExpectedMarginRate: number;
    selling_price: number;
}

//  🆕 6. 플랫폼별 마진 정보를 Dict화 (PlatformMargins)
export interface PlatformMargins {
    smartstore: CalculatedItemInfo;
    coupang: CalculatedItemInfo;
    auction: CalculatedItemInfo;
    gmarket: CalculatedItemInfo;
    elevenst: CalculatedItemInfo;
    openmarket: CalculatedItemInfo;
}

//  🆕 7. 전체 마진 목록을 originGoodsCode 기준으로 Dict화 (MarginListByItems)
export interface MarginListByItems {
    items: Record<string, PlatformMargins>;
}



export interface Product {
    id: string;
    name: string;
    thumbnail: string;
    originalPrice: number | string;
    currency: string;
    tags?: string[];
    originGoodsCode: string;
    goods_origin?: string | number;
    total_price?: number | string;
    promotion_period?: string;
    selling_price?: string | number;
    sold_out?: string | number;
    winner_price?: string | number;
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


export interface ProductPriceData {
    originGoodsCode: string;
    settingPrice: number;
    smartstoreExpectedMargin?: number;
    smartstoreExpectedMarginRate?: number;
    salesPrice?: number;
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
    platformMarginRateInfo: PlatformMarginRateInfo;
    marginListByItems: MarginListByItems;
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
    sellingPriceFormulaInfo: SellingPriceFormulaInfo;
    platformMargins: PlatformMargins;
    isExchangeRateExpanded: boolean;
    isFormulaExpanded: boolean;
    onAppliedRateChange: (currency: string, value: number) => void;
    onSyncRates: () => void;
    onFormulaChange: (field: keyof SellingPriceFormulaInfo, value: any) => void;
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
    sellingPriceFormulaInfo: SellingPriceFormulaInfo;
    platformMargins: PlatformMargins;
    onFormulaChange: (field: keyof SellingPriceFormulaInfo, value: any) => void;
    onPlatformMarginChange: (platform: keyof PlatformMargins, value: number) => void;
}

export interface PriceSettingModalFooterProps {
    onSave: (saveData: SaveData) => void;
    onReset: () => void;
    onCalculateMargin: () => void;
    originGoodsCode: string;
    isCalculated: boolean;
    exchangeRates: Array<{ currency: string; value: number }>;
    sellingPriceFormulaInfo: SellingPriceFormulaInfo;
    platformMargins: PlatformMargins;
    calculatedProducts: CalculatedProductData[];
}

export type ExchangeRate = ExchangeRateData;
export type SelectedProduct = Product;
