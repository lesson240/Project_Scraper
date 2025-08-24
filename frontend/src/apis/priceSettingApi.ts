// path: frontend/src/apis/priceSettingApi.ts
import config from '@/config/api';

export interface PriceSettingSaveRequest {
  exchangeRates: Array<{
    currencyCode: string;
    appliedRate: number;
  }>;
  updatedProducts: Array<{
    originGoodsCode: string;
    settingPrice: number;
    calculatedPrice?: any;
    exchangeRate?: number;
  }>;
  formulaSettings?: any;
  platformMargins?: any;
}

export interface PriceSettingSaveResponse {
  success: boolean;
  message: string;
  saved_exchange_rates: Array<{
    currency: string;
    value: number;
    id: string;
  }>;
  updated_products_count: number;
  timestamp: string;
}

/**
 * 가격 설정 모달에서 환율 저장 및 상품 가격 업데이트
 */
export async function savePriceSettingData(
  data: PriceSettingSaveRequest
): Promise<PriceSettingSaveResponse> {
  try {
    const response = await fetch(`${config.baseUrl}/v1/api/price-setting/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('가격 설정 데이터 저장 실패:', error);
    throw new Error(`가격 설정 데이터 저장 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
