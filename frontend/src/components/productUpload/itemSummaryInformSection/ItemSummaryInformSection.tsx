// 상품관리 - 요약/리스트 영역 컴포넌트
// [설명] 상품 목록(간단 테이블) 렌더링

import React from "react";
import "@/styles/upload/itemSummaryInformSection.css";

/**
 * 상품 리스트/요약 테이블
 * - 상품 썸네일, 이름, 기능 버튼, 상세정보 등 표시
 * - 실데이터 바인딩 전까지는 예시로 구현
 */



const sampleData = [
    {
        id: 1,
        image: "/images/sample-product-1.jpg",
        title: "다프네 두꺼운 밑창 헬시 숏 부츠 여성 가을 겨울용 벨벳...",
        memo: "",
        market: "Taobao",
        priceRange: "429 ~ 429",
        tags: [],
        priceRequired: true,
        tagRequired: true,
    },
    {
        id: 2,
        image: "/images/sample-product-2.jpg",
        title: "여성용 찰시 숏 부츠 2024년 신상품 울매치 레트로...",
        memo: "",
        market: "Taobao",
        priceRange: "163 ~ 163",
        tags: [],
        priceRequired: true,
        tagRequired: true,
    },
];

export default function ItemSummaryInformSection() {
    return (
        <div className="product-manage-table">
            <div className="table-head">
                <div className="table-col checkbox-col">
                    <input type="checkbox" />
                    <span>수집 마켓</span>
                </div>
                <div className="table-col info-col">상품정보</div>
                <div className="table-col action-col">기능</div>
                <div className="table-col detail-col">상세정보</div>
            </div>

            {sampleData.map((item) => (
                <div key={item.id} className="table-row">
                    <div className="table-col checkbox-col">
                        <input type="checkbox" />
                        <div className="market-label">Taobao</div>
                    </div>
                    <div className="table-col info-col">
                        <img src={item.image} alt="상품 썸네일" className="thumb" />
                        <div className="product-details">
                            <div className="product-title">{item.title}</div>
                            <div className="meta">메모를 입력해주세요</div>
                            <div className="meta">업로드 마켓: {item.market}</div>
                        </div>
                    </div>
                    <div className="table-col action-col">
                        <button className="btn">수정</button>
                        <button className="btn btn--gray">상세페이지</button>
                        <button className="btn btn--gray">업로드 로그</button>
                    </div>
                    <div className="table-col detail-col">
                        <div className="price">원본 할인가 (¥): {item.priceRange}</div>
                        {item.priceRequired && (
                            <div className="alert">가격 설정해 주세요</div>
                        )}
                        {item.tagRequired && (
                            <div className="alert">태그 설정해 주세요</div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}