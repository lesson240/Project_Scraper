// path: frontend/src/utils/priceCalculation.ts
import type {
    PlatformMarginRateInfo,
    CalculatedProductData,
    CalculatedItemInfo,
} from "@/types/priceSetting.types";




/**
 * 마진을 계산합니다.
 * @param originGoodsCode 원본 상품 코드
 * @param originalPrice 원본 가격 (원가)
 * @param exchangeRate 환율
 * @param baseMarginRate 기본 마진율 (%)
 * @param additionalMargin 추가 마진
 * @param internationalShippingFee 국제운송료
 * @param platformMarginRates 플랫폼별 마진율
 * @returns 계산된 상품 데이터
 */
export function calculatePlatformMargins(
    originGoodsCode: string,
    originalPrice: number,
    exchangeRate: number = 1,
    baseMarginRate: number,
    additionalMargin: number,
    internationalShippingFee: number = 0,
    platformMarginRates: PlatformMarginRateInfo
): CalculatedProductData {
    if (originalPrice <= 0) {
        throw new Error('원본 가격이 0 이하일 수 없습니다.');
    }

    // UI 공식: 원가×환율×(1+기본 마진율)+추가마진+국제운송료 = 기본 판매가(설정 상품가)
    const costInKRW = originalPrice * exchangeRate;
    const basePrice = costInKRW * (1 + baseMarginRate / 100) + additionalMargin + internationalShippingFee;

    // Record<string, CalculatedItemInfo> 타입으로 변경
    const marginList: Record<string, CalculatedItemInfo> = {};

    // 스마트스토어 마진 계산 (기본 공식)
    const expectedMargin = basePrice - costInKRW - internationalShippingFee;
    const expectedMarginRate = basePrice > 0 ? (expectedMargin / basePrice) * 100 : 0;

    // 각 플랫폼별로 CalculatedItemInfo 객체 생성
    marginList.smartstore = {
        ExpectedMargin: Math.max(0, Math.round(expectedMargin * 100) / 100),
        ExpectedMarginRate: Math.max(0, Math.round(expectedMarginRate * 100) / 100),
        selling_price: basePrice
    };

    // 각 플랫폼별 마진 계산
    Object.entries(platformMarginRates).forEach(([platform, marginRate]) => {
        if (platform === 'smartstore') return; // 이미 계산됨

        // 플랫폼별 판매가: 원가×환율×(1+플랫폼 마진율)+추가마진+국제운송료
        const platformPrice = costInKRW * (1 + marginRate / 100) + additionalMargin + internationalShippingFee;

        // 플랫폼별 마진: 플랫폼 판매가 - (원가 × 환율)
        const platformExpectedMargin = platformPrice - costInKRW - internationalShippingFee;
        const platformExpectedMarginRate = platformPrice > 0 ? (platformExpectedMargin / platformPrice) * 100 : 0;

        // 각 플랫폼별로 CalculatedItemInfo 객체 생성
        marginList[platform] = {
            ExpectedMargin: Math.max(0, Math.round(platformExpectedMargin * 100) / 100),
            ExpectedMarginRate: Math.max(0, Math.round(platformExpectedMarginRate * 100) / 100),
            selling_price: platformPrice
        };
    });

    return {
        originGoodsCode,
        originalPrice,
        exchangeRate,
        marginList
    };
}

/**
 * 여러 상품의 마진을 일괄 계산합니다.
 */
export function calculateAllProductsMargins(
    products: Array<{
        originGoodsCode: string;
        originalPrice: number;
        exchangeRate?: number;
        baseMarginRate?: number;
        additionalMargin?: number;
        internationalShippingFee?: number;
    }>,
    baseMarginRate: number = 0,
    additionalMargin: number = 0,
    internationalShippingFee: number = 0,
    platformMarginRates: PlatformMarginRateInfo
): CalculatedProductData[] {
    return products.map(product =>
        calculatePlatformMargins(
            product.originGoodsCode,
            product.originalPrice,
            product.exchangeRate || 1,
            product.baseMarginRate || baseMarginRate,
            product.additionalMargin || additionalMargin,
            product.internationalShippingFee || internationalShippingFee,
            platformMarginRates
        )
    );
}
