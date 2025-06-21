// 상품관리 - 기능(탭 버튼) 영역 컴포넌트
// [설명] 가격설정, 태그설정 등 기능별 탭 버튼 UI

import React from "react";

/**
 * 기능 탭 영역
 * - 가격설정/태그설정/상세페이지설정 등 여러 탭 버튼 표시
 */
export default function FunctionSection() {
    return (
        <nav className="product-manage-tabs">
            {/* 각 탭 버튼마다 .tab-btn / .active 클래스 활용 */}
            <button className="tab-btn">가격 설정</button>
            <button className="tab-btn">태그 설정</button>
            <button className="tab-btn">상세페이지 설정</button>
            <button className="tab-btn">상품명 설정</button>
            <button className="tab-btn active">판매등록</button>
            <button className="tab-btn btn--red">상품 삭제</button>
        </nav>
    );
}
