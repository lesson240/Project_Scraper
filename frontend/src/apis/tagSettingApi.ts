// path: frontend/src/apis/tagSettingApi.ts
import type { KeywordData, SearchFilters } from '@/types/tagSetting.types';

export interface TagSettingApiResponse {
    success: boolean;
    data?: any;
    message?: string;
}

class TagSettingApiService {
    private baseUrl: string;
    private timeout: number;

    constructor() {
        this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        this.timeout = 10000;
    }

    // 키워드 검색
    async searchKeywords(query: string): Promise<KeywordData[]> {
        try {
            // 실제 API 호출 대신 더미 데이터 반환
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const dummyData: KeywordData[] = [
                {
                    keyword: '크리스탈',
                    monthlySearchVolume: { pc: 5140, mobile: 34300 },
                    monthlyAverageClicks: { pc: 0, mobile: 0 },
                    competitionIntensity: 'low',
                    monthlyAverageCTR: { pc: 0, mobile: 0 }
                },
                {
                    keyword: '원석나라',
                    monthlySearchVolume: { pc: 370, mobile: 1470 },
                    monthlyAverageClicks: { pc: 8.9, mobile: 48 },
                    competitionIntensity: 'medium',
                    monthlyAverageCTR: { pc: 2.6, mobile: 3.56 }
                },
                {
                    keyword: '샹들리에조명',
                    monthlySearchVolume: { pc: 330, mobile: 2140 },
                    monthlyAverageClicks: { pc: 9.1, mobile: 84.8 },
                    competitionIntensity: 'high',
                    monthlyAverageCTR: { pc: 2.88, mobile: 4.22 }
                },
                {
                    keyword: '핫픽스',
                    monthlySearchVolume: { pc: 590, mobile: 1290 },
                    monthlyAverageClicks: { pc: 4.9, mobile: 23 },
                    competitionIntensity: 'high',
                    monthlyAverageCTR: { pc: 0.92, mobile: 1.97 }
                }
            ];

            return dummyData.filter(item => 
                item.keyword.toLowerCase().includes(query.toLowerCase())
            );
        } catch (error) {
            console.error('키워드 검색 실패:', error);
            throw new Error('키워드 검색에 실패했습니다.');
        }
    }

    // 연관 검색어 조회
    async getRelatedKeywords(keyword: string): Promise<string[]> {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const relatedKeywords: { [key: string]: string[] } = {
                '크리스탈': ['크리스탈 원석', '크리스탈 보석', '크리스탈 장식'],
                '원석나라': ['원석', '보석', '천연원석'],
                '샹들리에조명': ['샹들리에', '조명', '인테리어 조명'],
                '핫픽스': ['핫픽스 스톤', '스톤', '장식재']
            };

            return relatedKeywords[keyword] || [];
        } catch (error) {
            console.error('연관 검색어 조회 실패:', error);
            return [];
        }
    }

    // 검색광고 키워드 조회
    async getSearchAdKeywords(filters: SearchFilters): Promise<KeywordData[]> {
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // 필터 적용 로직 (실제로는 서버에서 처리)
            const allKeywords = await this.searchKeywords('');
            return allKeywords.filter(item => {
                if (filters.monthlySearchVolume.enabled) {
                    const volume = filters.platform === 'pc' ? item.monthlySearchVolume.pc : item.monthlySearchVolume.mobile;
                    if (volume < filters.monthlySearchVolume.min || volume > filters.monthlySearchVolume.max) {
                        return false;
                    }
                }
                
                if (filters.competitionIntensity.enabled && item.competitionIntensity !== filters.competitionIntensity.value) {
                    return false;
                }
                
                return true;
            });
        } catch (error) {
            console.error('검색광고 키워드 조회 실패:', error);
            throw new Error('검색광고 키워드 조회에 실패했습니다.');
        }
    }

    // 태그 저장
    async saveTags(productId: string, tags: string[]): Promise<TagSettingApiResponse> {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            console.log(`상품 ${productId}에 태그 저장:`, tags);
            
            return {
                success: true,
                message: '태그가 성공적으로 저장되었습니다.'
            };
        } catch (error) {
            console.error('태그 저장 실패:', error);
            return {
                success: false,
                message: '태그 저장에 실패했습니다.'
            };
        }
    }
}

export const tagSettingApiService = new TagSettingApiService();
