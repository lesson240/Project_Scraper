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
 * @param totalPrice 할인가 (선택사항)
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
    platformMarginRates: PlatformMarginRateInfo,
    totalPrice?: number
): CalculatedProductData {
    if (originalPrice <= 0) {
        throw new Error('원본 가격이 0 이하일 수 없습니다.');
    }

    // 할인가가 없으면 원가를 할인가로 사용
    const finalTotalPrice = totalPrice || originalPrice;

    // 원가와 할인가를 각각 KRW로 변환
    const originalPriceInKRW = originalPrice * exchangeRate;
    const totalPriceInKRW = finalTotalPrice * exchangeRate;

    // 원가 기준 설정 상품가 계산
    const originalBasePrice = originalPriceInKRW * (1 + baseMarginRate / 100) + additionalMargin + internationalShippingFee;
    
    // 할인가 기준 설정 상품가 계산
    const totalBasePrice = totalPriceInKRW * (1 + baseMarginRate / 100) + additionalMargin + internationalShippingFee;

    // Record<string, CalculatedItemInfo> 타입으로 변경
    const marginList: Record<string, CalculatedItemInfo> = {};

    // 스마트스토어 마진 계산 (기본 공식 - 원가 기준)
    const expectedMargin = originalBasePrice - originalPriceInKRW - internationalShippingFee;
    const expectedMarginRate = originalBasePrice > 0 ? (expectedMargin / originalBasePrice) * 100 : 0;

    // 원가 기준 마진 계산
    const originalPriceMargin = originalBasePrice - originalPriceInKRW - internationalShippingFee;
    const originalPriceMarginRate = originalBasePrice > 0 ? (originalPriceMargin / originalBasePrice) * 100 : 0;

    // 할인가 기준 마진 계산
    const totalPriceMargin = totalBasePrice - totalPriceInKRW - internationalShippingFee;
    const totalPriceMarginRate = totalBasePrice > 0 ? (totalPriceMargin / totalBasePrice) * 100 : 0;

    // 각 플랫폼별로 CalculatedItemInfo 객체 생성
    marginList.smartstore = {
        ExpectedMargin: Math.max(0, Math.round(expectedMargin * 100) / 100),
        ExpectedMarginRate: Math.max(0, Math.round(expectedMarginRate * 100) / 100),
        selling_price: originalBasePrice, // 원가 기준 설정 상품가
        originalPriceMargin: Math.max(0, Math.round(originalPriceMargin * 100) / 100),
        originalPriceMarginRate: Math.max(0, Math.round(originalPriceMarginRate * 100) / 100),
        totalPriceMargin: Math.max(0, Math.round(totalPriceMargin * 100) / 100),
        totalPriceMarginRate: Math.max(0, Math.round(totalPriceMarginRate * 100) / 100),
        totalPriceSellingPrice: totalBasePrice // 할인가 기준 설정 상품가
    };

    // 각 플랫폼별 마진 계산
    Object.entries(platformMarginRates).forEach(([platform, marginRate]) => {
        if (platform === 'smartstore') return; // 이미 계산됨

        // 원가 기준 플랫폼별 판매가: 원가×환율×(1+플랫폼 마진율)+추가마진+국제운송료
        const originalPlatformPrice = originalPriceInKRW * (1 + marginRate / 100) + additionalMargin + internationalShippingFee;
        
        // 할인가 기준 플랫폼별 판매가: 할인가×환율×(1+플랫폼 마진율)+추가마진+국제운송료
        const totalPlatformPrice = totalPriceInKRW * (1 + marginRate / 100) + additionalMargin + internationalShippingFee;

        // 원가 기준 마진 계산
        const platformOriginalPriceMargin = originalPlatformPrice - originalPriceInKRW - internationalShippingFee;
        const platformOriginalPriceMarginRate = originalPlatformPrice > 0 ? (platformOriginalPriceMargin / originalPlatformPrice) * 100 : 0;

        // 할인가 기준 마진 계산
        const platformTotalPriceMargin = totalPlatformPrice - totalPriceInKRW - internationalShippingFee;
        const platformTotalPriceMarginRate = totalPlatformPrice > 0 ? (platformTotalPriceMargin / totalPlatformPrice) * 100 : 0;

        // 각 플랫폼별로 CalculatedItemInfo 객체 생성
        marginList[platform] = {
            ExpectedMargin: Math.max(0, Math.round(platformOriginalPriceMargin * 100) / 100),
            ExpectedMarginRate: Math.max(0, Math.round(platformOriginalPriceMarginRate * 100) / 100),
            selling_price: originalPlatformPrice, // 원가 기준 설정 상품가
            originalPriceMargin: Math.max(0, Math.round(platformOriginalPriceMargin * 100) / 100),
            originalPriceMarginRate: Math.max(0, Math.round(platformOriginalPriceMarginRate * 100) / 100),
            totalPriceMargin: Math.max(0, Math.round(platformTotalPriceMargin * 100) / 100),
            totalPriceMarginRate: Math.max(0, Math.round(platformTotalPriceMarginRate * 100) / 100),
            totalPriceSellingPrice: totalPlatformPrice // 할인가 기준 설정 상품가
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
        totalPrice?: number;
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
            platformMarginRates,
            product.totalPrice
        )
    );
}
