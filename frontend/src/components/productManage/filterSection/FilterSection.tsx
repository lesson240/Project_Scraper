// 상품관리 - 필터 입력 영역 컴포넌트
// [설명] 상품명, 코드, 메모 등으로 검색 가능한 입력/선택 UI입니다.

import React from "react";

/**
 * 필터 입력 UI
 * - 상품 그룹, 상품명, 메모, 마켓, 코드, 작업번호 등
 * - 검색/초기화 버튼 제공
 */
export default function FilterSection() {
    return (
        <section className="product-manage-filter">
            {/* 1행: 상품 그룹, 상품명, 메모, 마켓/계정 */}
            <div className="product-manage-filter__row">
                <select className="product-manage-filter__input">
                    <option value="">상품 그룹명을 선택해주세요</option>
                    <option value="A">그룹A</option>
                    <option value="B">그룹B</option>
                </select>
                <input
                    className="product-manage-filter__input"
                    type="text"
                    placeholder="상품명을 입력해주세요."
                />
                <input
                    className="product-manage-filter__input"
                    type="text"
                    placeholder="메모를 입력해주세요."
                />
                <select className="product-manage-filter__input">
                    <option value="">마켓과 계정을 선택해주세요</option>
                    <option value="smartstore">스마트스토어</option>
                    <option value="taobao">타오바오</option>
                </select>
            </div>

            {/* 2행: 업로드/수집 작업번호, 상품코드 */}
            <div className="product-manage-filter__row">
                <input
                    className="product-manage-filter__input"
                    type="text"
                    placeholder="업로드 작업번호를 입력해주세요."
                />
                <input
                    className="product-manage-filter__input"
                    type="text"
                    placeholder="수집 작업번호를 입력해주세요."
                />
                <input
                    className="product-manage-filter__input"
                    type="text"
                    placeholder="쉼표(,)로 구분하여 코드 복수 입력이 가능합니다."
                />
            </div>

            {/* 3행: 오른쪽 정렬 버튼 그룹 */}
            <div className="product-manage-filter__row product-manage-filter__row--right">
                <div className="product-manage-filter__button-group">
                    <button className="btn btn--reset">초기화</button>
                    <button className="btn btn--gray">기간 설정</button>
                    <button className="btn">검색</button>
                </div>
            </div>
        </section>
    );
}