// path: frontend/src/hooks/useTagSetting.ts
import { useState, useCallback } from 'react';
import { tagSettingApiService } from '@/apis/tagSettingApi';
import type { KeywordData, SearchFilters, TagSettings } from '@/types/tagSetting.types';

export const useTagSetting = () => {
    const [keywords, setKeywords] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [keywordSearchResults, setKeywordSearchResults] = useState<KeywordData[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchFilters, setSearchFilters] = useState<SearchFilters>({
        monthlySearchVolume: { enabled: false, min: 0, max: 0 },
        monthlyAverageClicks: { enabled: false, min: 0, max: 0 },
        monthlyAverageCTR: { enabled: false, min: 0, max: 0 },
        competitionIntensity: { enabled: false, value: 'low' },
        platform: 'mobile'
    });

    // 키워드 추가
    const addKeyword = useCallback((keyword: string) => {
        if (keyword && !keywords.includes(keyword)) {
            setKeywords(prev => [...prev, keyword]);
        }
    }, [keywords]);

    // 키워드 제거
    const removeKeyword = useCallback((keyword: string) => {
        setKeywords(prev => prev.filter(k => k !== keyword));
    }, []);

    // 태그 추가
    const addTag = useCallback((tag: string) => {
        if (tag && !tags.includes(tag)) {
            setTags(prev => [...prev, tag]);
        }
    }, [tags]);

    // 태그 제거
    const removeTag = useCallback((tag: string) => {
        setTags(prev => prev.filter(t => t !== tag));
    }, []);

    // 키워드 검색
    const searchKeywords = useCallback(async (query: string) => {
        if (!query.trim()) {
            setKeywordSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const results = await tagSettingApiService.searchKeywords(query);
            setKeywordSearchResults(results);
        } catch (error) {
            console.error('키워드 검색 실패:', error);
            setKeywordSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // 검색 필터 변경
    const updateSearchFilters = useCallback((filters: Partial<SearchFilters>) => {
        setSearchFilters(prev => ({ ...prev, ...filters }));
    }, []);

    // 필터 적용
    const applyFilters = useCallback(async () => {
        setIsSearching(true);
        try {
            const results = await tagSettingApiService.getSearchAdKeywords(searchFilters);
            setKeywordSearchResults(results);
        } catch (error) {
            console.error('필터 적용 실패:', error);
        } finally {
            setIsSearching(false);
        }
    }, [searchFilters]);

    // TOP5 선택
    const selectTop5 = useCallback(() => {
        const top5Keywords = keywordSearchResults
            .slice(0, 5)
            .map(item => item.keyword);
        
        setKeywords(prev => {
            const newKeywords = [...prev];
            top5Keywords.forEach(keyword => {
                if (!newKeywords.includes(keyword)) {
                    newKeywords.push(keyword);
                }
            });
            return newKeywords;
        });
    }, [keywordSearchResults]);

    // 초기화
    const reset = useCallback(() => {
        setKeywords([]);
        setTags([]);
        setKeywordSearchResults([]);
        setSearchFilters({
            monthlySearchVolume: { enabled: false, min: 0, max: 0 },
            monthlyAverageClicks: { enabled: false, min: 0, max: 0 },
            monthlyAverageCTR: { enabled: false, min: 0, max: 0 },
            competitionIntensity: { enabled: false, value: 'low' },
            platform: 'mobile'
        });
    }, []);

    // 설정 가져오기
    const getSettings = useCallback((): TagSettings => ({
        keywords,
        tags,
        searchFilters
    }), [keywords, tags, searchFilters]);

    return {
        keywords,
        tags,
        keywordSearchResults,
        isSearching,
        searchFilters,
        addKeyword,
        removeKeyword,
        addTag,
        removeTag,
        searchKeywords,
        updateSearchFilters,
        applyFilters,
        selectTop5,
        reset,
        getSettings
    };
};
