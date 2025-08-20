// path: frontend/src/components/productUpload/modals/TagSettingModal/TagSettingModalContainer.tsx
import React from 'react';
import TagSettingModal from './TagSettingModal';
import { useTagSetting } from '@/hooks/useTagSetting';
import type { TagSettingModalProps, TagSettings } from '@/types/tagSetting.types';

export default function TagSettingModalContainer({
    isOpen,
    onClose,
    selectedProducts,
    onSave
}: TagSettingModalProps) {
    const {
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
    } = useTagSetting();

    const handleSave = () => {
        const settings = getSettings();
        onSave(settings);
        onClose();
    };

    const handleReset = () => {
        reset();
    };

    const handleKeywordAdd = (keyword: string) => {
        addKeyword(keyword);
    };

    const handleKeywordRemove = (keyword: string) => {
        removeKeyword(keyword);
    };

    const handleTagAdd = (tag: string) => {
        addTag(tag);
    };

    const handleTagRemove = (tag: string) => {
        removeTag(tag);
    };

    const handleKeywordSearch = (query: string) => {
        searchKeywords(query);
    };

    const handleSearchFiltersChange = (filters: Partial<typeof searchFilters>) => {
        updateSearchFilters(filters);
    };

    const handleApplyFilters = () => {
        applyFilters();
    };

    const handleSelectTop5 = () => {
        selectTop5();
    };

    return (
        <TagSettingModal
            isOpen={isOpen}
            onClose={onClose}
            selectedProducts={selectedProducts}
            keywords={keywords}
            tags={tags}
            keywordSearchResults={keywordSearchResults}
            searchFilters={searchFilters}
            isSearching={isSearching}
            onKeywordAdd={handleKeywordAdd}
            onKeywordRemove={handleKeywordRemove}
            onTagAdd={handleTagAdd}
            onTagRemove={handleTagRemove}
            onKeywordSearch={handleKeywordSearch}
            onSearchFiltersChange={handleSearchFiltersChange}
            onApplyFilters={handleApplyFilters}
            onSelectTop5={handleSelectTop5}
            onSave={handleSave}
            onReset={handleReset}
        />
    );
}
