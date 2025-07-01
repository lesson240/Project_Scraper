import React from "react";

import "@/styles/common/button.css";
import "@/styles/section.css"


export default function FunctionSection() {
    return (
        <nav className="product-upload-tabs">
            {/* 각 탭 버튼마다 .tab-btn / .active 클래스 활용 */}
            <button className="btn-fourth">가격 설정</button>
            <button className="btn.fourth">태그 설정</button>
            <button className="tab-btn">상세페이지 설정</button>
            <button className="tab-btn">상품명 설정</button>
            <button className="tab-btn active">판매등록</button>
            <button className="tab-btn btn--red">상품 삭제</button>
        </nav>
    );
}
