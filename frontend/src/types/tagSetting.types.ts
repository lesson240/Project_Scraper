// src/types/tagSetting.types.ts

export interface Product {
    id: string;
    name: string;
    thumbnail: string;
    tags: string[];
}

export interface KeywordData {
    keyword: string;
    monthlySearchVolume: {
        pc: number;
        mobile: number;
    };
    monthlyAverageClicks: {
        pc: number;
        mobile: number;
    };
    competitionIntensity: 'low' | 'medium' | 'high';
    monthlyAverageCTR: {
        pc: number;
        mobile: number;
    };
}

export interface TagSettingModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedProducts: Product[];
    onSave: (settings: TagSettings) => void;
}

export interface TagSettingModalUIProps {
    isOpen: boolean;
    onClose: () => void;
    selectedProducts: Product[];
    keywords: string[];
    tags: string[];
    keywordSearchResults: KeywordData[];
    searchFilters: SearchFilters;
    isSearching: boolean;
    onKeywordAdd: (keyword: string) => void;
    onKeywordRemove: (keyword: string) => void;
    onTagAdd: (tag: string) => void;
    onTagRemove: (tag: string) => void;
    onKeywordSearch: (query: string) => void;
    onSearchFiltersChange: (filters: Partial<SearchFilters>) => void;
    onApplyFilters: () => void;
    onSelectTop5: () => void;
    onSave: () => void;
    onReset: () => void;
}

export interface SearchFilters {
    monthlySearchVolume: {
        enabled: boolean;
        min: number;
        max: number;
    };
    monthlyAverageClicks: {
        enabled: boolean;
        min: number;
        max: number;
    };
    monthlyAverageCTR: {
        enabled: boolean;
        min: number;
        max: number;
    };
    competitionIntensity: {
        enabled: boolean;
        value: 'low' | 'medium' | 'high';
    };
    platform: 'pc' | 'mobile';
}

export interface TagSettings {
    keywords: string[];
    tags: string[];
    searchFilters: SearchFilters;
}
