// 상품관리 - 요약/리스트 영역 컴포넌트
// [설명] 상품 목록(간단 테이블) 렌더링

import React from "react";

/**
 * 상품 리스트/요약 테이블
 * - 상품 썸네일, 이름, 기능 버튼, 상세정보 등 표시
 * - 실데이터 바인딩 전까지는 예시로 구현
 */
export default function ItemSummaryInformSection() {
    return (
        <div className="product-manage-list">
            {/* 상품 row 예시 */}
            <div className="product-manage-item">
                {/* 썸네일 */}
                <img
                    src="/images/sample-product-1.jpg"
                    alt="상품1"
                    className="thumb"
                />
                {/* 상품 정보 */}
                <div className="item-info">
                    <div>워터가드 주방 세정제 강력한 살균 세정제...</div>
                    <div className="item-meta">메모를 입력해주세요</div>
                    <div className="item-meta">업로드 마켓: Taobao</div>
                </div>
                {/* 기능 버튼 예시 */}
                <button className="btn">수정</button>
                {/* 상세/업로드 로그 */}
                <button className="btn btn--gray">상세페이지</button>
                <button className="btn btn--gray">업로드 로그</button>
                {/* 상태/알림 */}
                <div style={{ minWidth: 140, color: "#ff5959" }}>
                    <div>가격 설정해 주세요</div>
                    <div>태그 설정해 주세요</div>
                </div>
            </div>

            {/* 상품 row 2 예시 */}
            <div className="product-manage-item">
                <img
                    src="/images/sample-product-2.jpg"
                    alt="상품2"
                    className="thumb"
                />
                <div className="item-info">
                    <div>떠다니는 기름때 청소, 강력한 세척제로...</div>
                    <div className="item-meta">메모를 입력해주세요</div>
                    <div className="item-meta">업로드 마켓: Taobao</div>
                </div>
                <button className="btn">수정</button>
                <button className="btn btn--gray">상세페이지</button>
                <button className="btn btn--gray">업로드 로그</button>
                <div style={{ minWidth: 140, color: "#ff5959" }}>
                    <div>가격 설정해 주세요</div>
                    <div>태그 설정해 주세요</div>
                </div>
            </div>
        </div>
    );
}
