// path: frontend/src/components/productUpload/modals/TagSettingModal/sections/KeywordSection.tsx
import React, { useState } from 'react';
import { FaQuestionCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './KeywordSection.css';

interface KeywordSectionProps {
    keywords: string[];
    tags: string[];
    onKeywordAdd: (keyword: string) => void;
    onKeywordRemove: (keyword: string) => void;
}

export default function KeywordSection({ keywords, tags, onKeywordAdd, onKeywordRemove }: KeywordSectionProps) {
    const [keywordInput, setKeywordInput] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    
    const predefinedKeywords = [
        '아크릴', '테이블탑', '스탠드', '광고', '브랜드', '로고', '프롬프트', '사인',
        '크리스탈', '테이블', '회사', '디스플레이', '라이브', '룸', '디스플레이', '스탠드'
    ];
    
    const itemsPerPage = 8;
    const totalPages = Math.ceil(predefinedKeywords.length / itemsPerPage);
    const currentKeywords = predefinedKeywords.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );

    const handleKeywordAdd = (keyword: string) => {
        if (!keywords.includes(keyword)) {
            onKeywordAdd(keyword);
        }
    };

    const handleKeywordRemove = (keyword: string) => {
        onKeywordRemove(keyword);
    };

    const handleCustomKeywordAdd = () => {
        if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
            onKeywordAdd(keywordInput.trim());
            setKeywordInput('');
        }
    };

    return (
        <div className="keyword-section">
            {/* 상품명 키워드 */}
            <div className="keyword-group">
                <div className="section-title">
                    <h4>상품명 키워드</h4>
                    <FaQuestionCircle className="info-icon" title="상품명에서 추출된 키워드입니다" />
                </div>
                
                <div className="keyword-scroll-container">
                    <button 
                        className="scroll-button left"
                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                        disabled={currentPage === 0}
                    >
                        <FaChevronLeft />
                    </button>
                    
                    <div className="keyword-list">
                        {currentKeywords.map((keyword, index) => (
                            <button
                                key={index}
                                className={`keyword-button ${keywords.includes(keyword) ? 'selected' : ''}`}
                                onClick={() => keywords.includes(keyword) 
                                    ? handleKeywordRemove(keyword) 
                                    : handleKeywordAdd(keyword)
                                }
                            >
                                {keyword}
                            </button>
                        ))}
                    </div>
                    
                    <button 
                        className="scroll-button right"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                        disabled={currentPage === totalPages - 1}
                    >
                        <FaChevronRight />
                    </button>
                </div>
                
                <div className="pagination-dots">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <span 
                            key={i} 
                            className={`dot ${i === currentPage ? 'active' : ''}`}
                            onClick={() => setCurrentPage(i)}
                        />
                    ))}
                </div>
            </div>

            {/* 키워드 검색 */}
            <div className="keyword-group">
                <div className="section-title">
                    <h4>키워드 검색</h4>
                    <FaQuestionCircle className="info-icon" title="키워드를 입력해주세요. 쉼표(,)를 통해 입력한 키워드에서 순차적으로 5개씩 검색됩니다." />
                </div>
                
                <div className="search-input-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="키워드를 입력해주세요. 쉼표(,)를 통해 입력한 키워드에서 순차적으로 5개씩 검색됩니다."
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCustomKeywordAdd()}
                    />
                    <button 
                        className="search-button"
                        onClick={handleCustomKeywordAdd}
                    >
                        Q
                    </button>
                </div>
            </div>

            {/* 태그 입력 */}
            <div className="keyword-group">
                <div className="section-title">
                    <h4>태그 입력</h4>
                    <FaQuestionCircle className="info-icon" title="쉼표(.) # 또는 공백으로 구분하여 태그 직접입력" />
                </div>
                
                <div className="search-input-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="쉼표(.) # 또는 공백으로 구분하여 태그 직접입력"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCustomKeywordAdd()}
                    />
                    <button 
                        className="search-button"
                        onClick={handleCustomKeywordAdd}
                    >
                        Q
                    </button>
                </div>
            </div>

            {/* 태그 목록 */}
            <div className="keyword-group">
                <div className="section-title">
                    <h4>태그 목록</h4>
                    <span className="tag-count">{tags.length}/20</span>
                </div>
                
                <div className="tag-list">
                    {tags.map((tag, index) => (
                        <div key={index} className="tag-item">
                            <span className="tag-text">{tag}</span>
                            <button 
                                className="tag-remove"
                                onClick={() => onKeywordRemove(tag)}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
