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
 * @param totalPrice 행사가 (선택사항)
 * @param exchangeRate 환율
 * @param baseMarginRate 기본 마진율 (%)
 * @param additionalMargin 추가 마진
 * @param internationalShippingFee 국제운송료
 * @param baseDiscount 할인가
 * @param baseDiscountUnit 할인 단위
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
    baseDiscount: number = 0,
    baseDiscountUnit: string = '원',
    platformMarginRates: PlatformMarginRateInfo,
    totalPrice?: number
): CalculatedProductData {
    if (originalPrice <= 0) {
        throw new Error('원본 가격이 0 이하일 수 없습니다.');
    }

    // 행사가가 없으면 원가를 행사가로 사용
    const finalTotalPrice = totalPrice || originalPrice;

    // 원가와 행사가를 각각 KRW로 변환
    const originalPriceInKRW = originalPrice * exchangeRate;
    const totalPriceInKRW = finalTotalPrice * exchangeRate;

    // 할인가/할인율 계산
    const calculateDiscountAmount = (basePrice: number) => {
        if (baseDiscountUnit === '%') {
            return basePrice * (baseDiscount / 100);
        } else {
            return baseDiscount;
        }
    };

    // 원가 기준 설정 상품가/ 할인 상품가 계산
    const originalBasePrice = originalPriceInKRW * (1 + baseMarginRate / 100) + additionalMargin + internationalShippingFee;
    const originalDiscountAmount = calculateDiscountAmount(originalBasePrice);
    const originalBasePriceWithDiscount = originalBasePrice - originalDiscountAmount;

    // 행사가 기준 설정 상품가/ 할인 상품가 계산
    const totalBasePrice = totalPriceInKRW * (1 + baseMarginRate / 100) + additionalMargin + internationalShippingFee;
    const totalDiscountAmount = calculateDiscountAmount(totalBasePrice);
    const totalBasePriceWithDiscount = totalBasePrice - totalDiscountAmount;

    // Record<string, CalculatedItemInfo> 타입으로 변경
    const marginList: Record<string, CalculatedItemInfo> = {};

    // 스마트스토어 마진 계산 (기본 공식 - 원가 기준)
    const expectedMargin = originalBasePrice - originalPriceInKRW - internationalShippingFee;
    const expectedMarginRate = originalBasePrice > 0 ? (expectedMargin / originalBasePrice) * 100 : 0;

    // 원가 기준 할인율/마진/마진율 계산
    const originalPriceDiscountRate = originalBasePrice > 0 ? (originalDiscountAmount / originalBasePrice) * 100 : 0;
    const originalPriceMargin = originalBasePriceWithDiscount - originalPriceInKRW - internationalShippingFee;
    const originalPriceMarginRate = originalBasePriceWithDiscount > 0 ? (originalPriceMargin / originalBasePriceWithDiscount) * 100 : 0;

    // 행사가 기준 할인율/마진/마진율 계산
    const totalPriceDiscountRate = totalBasePrice > 0 ? (totalDiscountAmount / totalBasePrice) * 100 : 0;
    const totalPriceMargin = totalBasePriceWithDiscount - totalPriceInKRW - internationalShippingFee;
    const totalPriceMarginRate = totalBasePriceWithDiscount > 0 ? (totalPriceMargin / totalBasePriceWithDiscount) * 100 : 0;

    // 각 플랫폼별로 CalculatedItemInfo 객체 생성_수정 필요
    marginList.smartstore = {
        ExpectedMargin: Math.max(0, Math.round(expectedMargin * 100) / 100),
        ExpectedMarginRate: Math.max(0, Math.round(expectedMarginRate * 100) / 100),
        originalBasePrice: originalBasePrice, // 원가 기준 설정 상품가
        originalBasePriceWithDiscount: originalBasePriceWithDiscount, // 원가 기준 설정 할인가
        originalPriceDiscountRate: Math.max(0, Math.round(originalPriceDiscountRate * 100) / 100), //원가 기준 할인율
        originalPriceMargin: Math.max(0, Math.round(originalPriceMargin * 100) / 100),
        originalPriceMarginRate: Math.max(0, Math.round(originalPriceMarginRate * 100) / 100),
        totalBasePrice: totalBasePrice, // 행사가 기준 설정 상품가
        totalBasePriceWithDiscount: totalBasePriceWithDiscount, // 행사가 기준 설정 할인가
        totalPriceDiscountRate: Math.max(0, Math.round(totalPriceDiscountRate * 100) / 100), //행사가 기준 할인율
        totalPriceMargin: Math.max(0, Math.round(totalPriceMargin * 100) / 100),
        totalPriceMarginRate: Math.max(0, Math.round(totalPriceMarginRate * 100) / 100),
    };

    // 각 플랫폼별 마진 계산
    Object.entries(platformMarginRates).forEach(([platform, marginRate]) => {
        if (platform === 'smartstore') return; // 이미 계산됨

        // 원가 기준 플랫폼별 설정 상품가 / 할인 상품가
        const originalPlatformPrice = originalPriceInKRW * (1 + marginRate / 100) + additionalMargin + internationalShippingFee;
        const platformOriginalDiscountAmount = calculateDiscountAmount(originalPlatformPrice);
        const originalPlatformPriceWithDiscount = originalPlatformPrice - platformOriginalDiscountAmount;
        
        // 행사가 기준 플랫폼별 설정 상품가 / 할인 상품가
        const totalPlatformPrice = totalPriceInKRW * (1 + marginRate / 100) + additionalMargin + internationalShippingFee;
        const platformTotalDiscountAmount = calculateDiscountAmount(totalPlatformPrice);
        const totalPlatformPriceWithDiscount = totalPlatformPrice - platformTotalDiscountAmount;

        // 원가 기준 할인율/마진/마진율 계산
        const platformOriginalPriceDiscountRate = originalPlatformPrice > 0 ? (platformOriginalDiscountAmount / originalPlatformPrice) * 100 : 0;
        const platformOriginalPriceMargin = originalPlatformPriceWithDiscount - originalPriceInKRW - internationalShippingFee;
        const platformOriginalPriceMarginRate = originalPlatformPriceWithDiscount > 0 ? (platformOriginalPriceMargin / originalPlatformPriceWithDiscount) * 100 : 0;

        // 행사가 기준 할인율/마진/마진율 계산
        const platformTotalPriceDiscountRate = totalPlatformPrice > 0 ? (platformTotalDiscountAmount / totalPlatformPrice) * 100 : 0;
        const platformTotalPriceMargin = totalPlatformPriceWithDiscount - totalPriceInKRW - internationalShippingFee;
        const platformTotalPriceMarginRate = totalPlatformPriceWithDiscount > 0 ? (platformTotalPriceMargin / totalPlatformPriceWithDiscount) * 100 : 0;

        // 각 플랫폼별로 CalculatedItemInfo 객체 생성
        marginList[platform] = {
            ExpectedMargin: Math.max(0, Math.round(platformOriginalPriceMargin * 100) / 100),
            ExpectedMarginRate: Math.max(0, Math.round(platformOriginalPriceMarginRate * 100) / 100),
            originalBasePrice: originalPlatformPrice, // 원가 기준 설정 상품가
            originalBasePriceWithDiscount: originalPlatformPriceWithDiscount, // 원가 기준 설정 할인가
            originalPriceDiscountRate: Math.max(0, Math.round(platformOriginalPriceDiscountRate * 100) / 100), //원가 기준 할인율
            originalPriceMargin: Math.max(0, Math.round(platformOriginalPriceMargin * 100) / 100),
            originalPriceMarginRate: Math.max(0, Math.round(platformOriginalPriceMarginRate * 100) / 100),
            totalBasePrice: totalPlatformPrice, // 행사가 기준 설정 상품가
            totalBasePriceWithDiscount: totalPlatformPriceWithDiscount, // 행사가 기준 설정 할인가
            totalPriceDiscountRate: Math.max(0, Math.round(platformTotalPriceDiscountRate * 100) / 100), //행사가 기준 할인율
            totalPriceMargin: Math.max(0, Math.round(platformTotalPriceMargin * 100) / 100),
            totalPriceMarginRate: Math.max(0, Math.round(platformTotalPriceMarginRate * 100) / 100),
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
        baseDiscount?: number;
        baseDiscountUnit?: string;
    }>,
    baseMarginRate: number = 0,
    additionalMargin: number = 0,
    internationalShippingFee: number = 0,
    baseDiscount: number = 0,
    baseDiscountUnit: string = '원',
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
            product.baseDiscount || baseDiscount,
            product.baseDiscountUnit || baseDiscountUnit,
            platformMarginRates,
            product.totalPrice
        )
    );
}
