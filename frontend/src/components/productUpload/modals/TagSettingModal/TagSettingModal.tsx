// path: frontend/src/components/productUpload/modals/TagSettingModal/TagSettingModal.tsx
import React from 'react';
import { ModalBase, ModalHeader, ModalBody, ModalFooter } from '@/components/common/Modal';
import KeywordSection from './sections/KeywordSection';
import KeywordAnalysisSection from './sections/KeywordAnalysisSection';
import type { TagSettingModalUIProps } from '@/types/tagSetting.types';
import '@/styles/productUpload/modals/TagSettingModal.css';

export default function TagSettingModal({
    isOpen,
    onClose,
    selectedProducts,
    keywords,
    tags,
    keywordSearchResults,
    searchFilters,
    isSearching,
    onKeywordAdd,
    onKeywordRemove,
    onTagAdd,
    onTagRemove,
    onKeywordSearch,
    onSearchFiltersChange,
    onApplyFilters,
    onSelectTop5,
    onSave,
    onReset
}: TagSettingModalUIProps) {
    if (!isOpen) return null;

    return (
        <ModalBase isOpen={isOpen} onClose={onClose}>
            <ModalHeader onClose={onClose}>
                <h2>태그 설정</h2>
                <div className="selected-products-badge">
                    선택상품 {selectedProducts.length}개
                </div>
            </ModalHeader>
            
            <ModalBody>
                <div className="tag-setting-container">
                    <div className="tag-setting-layout">
                        {/* 왼쪽 섹션: 키워드 관리 */}
                        <div className="left-section">
                            <KeywordSection
                                keywords={keywords}
                                tags={tags}
                                onKeywordAdd={onKeywordAdd}
                                onKeywordRemove={onKeywordRemove}
                            />
                        </div>
                        
                        {/* 오른쪽 섹션: 키워드 분석 */}
                        <div className="right-section">
                            <KeywordAnalysisSection
                                keywordSearchResults={keywordSearchResults}
                                searchFilters={searchFilters}
                                isSearching={isSearching}
                                onSearchFiltersChange={onSearchFiltersChange}
                                onApplyFilters={onApplyFilters}
                                onSelectTop5={onSelectTop5}
                            />
                        </div>
                    </div>
                </div>
            </ModalBody>
            
            <ModalFooter>
                <div className="modal-footer">
                    <button className="btn-reset" onClick={onReset}>
                        초기화
                    </button>
                    <button className="btn-save" onClick={onSave}>
                        저장
                    </button>
                </div>
            </ModalFooter>
        </ModalBase>
    );
}
