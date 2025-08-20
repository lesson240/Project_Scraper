// path: frontend/src/components/productUpload/modals/TagSettingModal/sections/KeywordAnalysisSection.tsx
import React, { useState } from 'react';
import { FaQuestionCircle, FaPlus } from 'react-icons/fa';
import type { KeywordData, SearchFilters } from '@/types/tagSetting.types';
import './KeywordAnalysisSection.css';

interface KeywordAnalysisSectionProps {
    keywordSearchResults: KeywordData[];
    searchFilters: SearchFilters;
    isSearching: boolean;
    onSearchFiltersChange: (filters: Partial<SearchFilters>) => void;
    onApplyFilters: () => void;
    onSelectTop5: () => void;
}

export default function KeywordAnalysisSection({
    keywordSearchResults,
    searchFilters,
    isSearching,
    onSearchFiltersChange,
    onApplyFilters,
    onSelectTop5
}: KeywordAnalysisSectionProps) {
    const [tagInput, setTagInput] = useState('');

    const handleFilterChange = (filterType: keyof SearchFilters, value: any) => {
        onSearchFiltersChange({ [filterType]: value });
    };

    const getCompetitionColor = (intensity: string) => {
        switch (intensity) {
            case 'low': return '#28a745';
            case 'medium': return '#ffc107';
            case 'high': return '#dc3545';
            default: return '#666';
        }
    };

    const getCompetitionText = (intensity: string) => {
        switch (intensity) {
            case 'low': return '낮음';
            case 'medium': return '중간';
            case 'high': return '높음';
            default: return intensity;
        }
    };

    return (
        <div className="keyword-analysis-section">
            {/* 자동완성 키워드 */}
            <div className="analysis-group">
                <div className="section-title">
                    <h4>자동완성키워드</h4>
                    <FaQuestionCircle className="info-icon" title="검색어 입력 시 자동완성되는 키워드입니다" />
                </div>
                
                <div className="no-results">
                    검색 결과가 없습니다.
                </div>
            </div>

            {/* 연관 검색어 */}
            <div className="analysis-group">
                <div className="section-title">
                    <h4>연관 검색어</h4>
                    <FaQuestionCircle className="info-icon" title="입력한 키워드와 연관된 검색어입니다" />
                </div>
                
                <div className="no-results">
                    검색 결과가 없습니다.
                </div>
            </div>

            {/* 검색광고 키워드 */}
            <div className="analysis-group">
                <div className="section-title">
                    <h4>검색광고 키워드</h4>
                    <FaQuestionCircle className="info-icon" title="검색광고 성과 데이터를 기반으로 한 키워드입니다" />
                </div>

                {/* 플랫폼 토글 */}
                <div className="platform-toggle">
                    <button
                        className={`toggle-btn ${searchFilters.platform === 'pc' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('platform', 'pc')}
                    >
                        PC 기준
                    </button>
                    <button
                        className={`toggle-btn ${searchFilters.platform === 'mobile' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('platform', 'mobile')}
                    >
                        모바일 기준
                    </button>
                </div>

                {/* 필터 옵션 */}
                <div className="filter-options">
                    <div className="filter-row">
                        <label className="filter-checkbox">
                            <input
                                type="checkbox"
                                checked={searchFilters.monthlySearchVolume.enabled}
                                onChange={(e) => handleFilterChange('monthlySearchVolume', {
                                    ...searchFilters.monthlySearchVolume,
                                    enabled: e.target.checked
                                })}
                            />
                            월간 검색수
                        </label>
                        <div className="filter-inputs">
                            <input
                                type="number"
                                value={searchFilters.monthlySearchVolume.min}
                                onChange={(e) => handleFilterChange('monthlySearchVolume', {
                                    ...searchFilters.monthlySearchVolume,
                                    min: parseInt(e.target.value) || 0
                                })}
                                placeholder="0"
                            />
                            <span>~</span>
                            <input
                                type="number"
                                value={searchFilters.monthlySearchVolume.max}
                                onChange={(e) => handleFilterChange('monthlySearchVolume', {
                                    ...searchFilters.monthlySearchVolume,
                                    max: parseInt(e.target.value) || 0
                                })}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="filter-row">
                        <label className="filter-checkbox">
                            <input
                                type="checkbox"
                                checked={searchFilters.monthlyAverageClicks.enabled}
                                onChange={(e) => handleFilterChange('monthlyAverageClicks', {
                                    ...searchFilters.monthlyAverageClicks,
                                    enabled: e.target.checked
                                })}
                            />
                            월평균 클릭 수
                        </label>
                        <div className="filter-inputs">
                            <input
                                type="number"
                                value={searchFilters.monthlyAverageClicks.min}
                                onChange={(e) => handleFilterChange('monthlyAverageClicks', {
                                    ...searchFilters.monthlyAverageClicks,
                                    min: parseInt(e.target.value) || 0
                                })}
                                placeholder="0"
                            />
                            <span>~</span>
                            <input
                                type="number"
                                value={searchFilters.monthlyAverageClicks.max}
                                onChange={(e) => handleFilterChange('monthlyAverageClicks', {
                                    ...searchFilters.monthlyAverageClicks,
                                    max: parseInt(e.target.value) || 0
                                })}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="filter-row">
                        <label className="filter-checkbox">
                            <input
                                type="checkbox"
                                checked={searchFilters.monthlyAverageCTR.enabled}
                                onChange={(e) => handleFilterChange('monthlyAverageCTR', {
                                    ...searchFilters.monthlyAverageCTR,
                                    enabled: e.target.checked
                                })}
                            />
                            월평균 클릭률
                        </label>
                        <div className="filter-inputs">
                            <input
                                type="number"
                                value={searchFilters.monthlyAverageCTR.min}
                                onChange={(e) => handleFilterChange('monthlyAverageCTR', {
                                    ...searchFilters.monthlyAverageCTR,
                                    min: parseInt(e.target.value) || 0
                                })}
                                placeholder="0"
                            />
                            <span>~</span>
                            <input
                                type="number"
                                value={searchFilters.monthlyAverageCTR.max}
                                onChange={(e) => handleFilterChange('monthlyAverageCTR', {
                                    ...searchFilters.monthlyAverageCTR,
                                    max: parseInt(e.target.value) || 0
                                })}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="filter-row">
                        <label className="filter-checkbox">
                            <input
                                type="checkbox"
                                checked={searchFilters.competitionIntensity.enabled}
                                onChange={(e) => handleFilterChange('competitionIntensity', {
                                    ...searchFilters.competitionIntensity,
                                    enabled: e.target.checked
                                })}
                            />
                            경쟁강도
                        </label>
                        <select
                            value={searchFilters.competitionIntensity.value}
                            onChange={(e) => handleFilterChange('competitionIntensity', {
                                ...searchFilters.competitionIntensity,
                                value: e.target.value as 'low' | 'medium' | 'high'
                            })}
                        >
                            <option value="low">낮음</option>
                            <option value="medium">중간</option>
                            <option value="high">높음</option>
                        </select>
                    </div>
                </div>

                {/* 필터 적용 버튼 */}
                <div className="filter-actions">
                    <button className="btn-apply" onClick={onApplyFilters}>
                        적용
                    </button>
                    <button className="btn-select-top5" onClick={onSelectTop5}>
                        <FaPlus className="plus-icon" />
                        TOP5 선택
                        <FaQuestionCircle className="info-icon-small" title="검색 결과 중 상위 5개 키워드를 선택합니다" />
                    </button>
                </div>

                {/* 키워드 결과 테이블 */}
                <div className="keyword-results-table">
                    <table>
                        <thead>
                            <tr>
                                <th>연관 키워드</th>
                                <th>월간 검색수</th>
                                <th>월평균 클릭수</th>
                                <th>경쟁 정도</th>
                                <th>월평균 클릭률</th>
                            </tr>
                        </thead>
                        <tbody>
                            {keywordSearchResults.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <button className="add-keyword-btn">
                                            <FaPlus />
                                            {item.keyword}
                                        </button>
                                    </td>
                                    <td>
                                        <div className="search-volume">
                                            <span className="pc-volume">PC: {item.monthlySearchVolume.pc.toLocaleString()}</span>
                                            <span className="mobile-volume">Mobile: {item.monthlySearchVolume.mobile.toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="click-count">
                                            <span className="pc-clicks">PC: {item.monthlyAverageClicks.pc}</span>
                                            <span className="mobile-clicks">Mobile: {item.monthlyAverageClicks.mobile}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span 
                                            className="competition-badge"
                                            style={{ color: getCompetitionColor(item.competitionIntensity) }}
                                        >
                                            {getCompetitionText(item.competitionIntensity)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="ctr">
                                            <span className="pc-ctr">PC: {item.monthlyAverageCTR.pc}%</span>
                                            <span className="mobile-ctr">Mobile: {item.monthlyAverageCTR.mobile}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
