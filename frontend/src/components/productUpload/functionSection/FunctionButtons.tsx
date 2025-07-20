import React, { useState } from "react";
import Button from "@/components/common/Button";
import ComboInput from "../../common/ComboInput"
import "@/styles/collect/filterButtons.css";
import "@/styles/section.css"
import "@/styles/upload/layoutToggle.css"
import "@/styles/upload/functionSection.css"


type Props = {
    onPriceSet: () => void;
    onTagSet: () => void;
    onDetailPageSet: () => void;
    onGoodsNameSet: () => void;
    onSalesRegistrationSet: () => void;
    onGoodsDeleteSet: () => void;
    pageSize: string;
    setPageSize: (size: string) => void;
    currentCount: number;
    totalCount: number;
};

export default function FunctionButtons({
    onPriceSet,
    onTagSet,
    onDetailPageSet,
    onGoodsNameSet,
    onSalesRegistrationSet,
    onGoodsDeleteSet,
    pageSize,
    setPageSize,
    currentCount,
    totalCount,
}: Props) {

    const [layout, setLayout] = useState<"grid" | "list">("grid");
    const isGrid = layout === "grid";



    return (
        <div className="button-box">
            <div className="section-row">
                <div className="combo-wrapper">
                    <span className="count-display">
                        {`조회 상품: ${currentCount}개 (총 ${totalCount}개)`}
                    </span>
                </div>
                <Button variant="secondary" onClick={onPriceSet}>가격 설정</Button>
                <Button variant="secondary" onClick={onTagSet}>태그 설정</Button>
                <Button variant="secondary" onClick={onDetailPageSet}>상세페이지 설정</Button>
                <Button variant="secondary" onClick={onGoodsNameSet}>상품명 설정</Button>
                <Button variant="third-rate" onClick={onSalesRegistrationSet}>판매 등록</Button>
                <Button variant="sixth" onClick={onGoodsDeleteSet}>상품 삭제</Button>
                <div className="toggle-wrapper">
                    <button
                        className={`toggle-button-left ${isGrid ? "active" : ""}`}
                        onClick={() => setLayout("grid")}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
                            <g data-name="그룹 11037" transform="translate(-1608 -571)">
                                <rect data-name="사각형 3882" width="20" height="2" rx="1" transform="translate(1613 578)" fill="#a7b0c7"></rect>
                                <rect data-name="사각형 3883" width="20" height="2" rx="1" transform="translate(1613 585)" fill="#a7b0c7"></rect>
                                <rect data-name="사각형 3884" width="20" height="2" rx="1" transform="translate(1613 592)" fill="#a7b0c7"></rect>
                            </g>
                                <path data-name="사각형 3885" fill="none" d="M0 0h30v30H0z"></path>
                        </svg>
                    </button>
                    <button
                        className={`toggle-button-right ${!isGrid ? "active" : ""}`}
                        onClick={() => setLayout("list")}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
                        <path data-name="사각형 3887" fill="none" d="M0 0h30v30H0z"></path>
                            <g data-name="그룹 11039" transform="translate(-1669 -570.303)">
                                <rect data-name="사각형 3888" width="11" height="2" rx="1" transform="translate(1683 580)" fill="#a7b0c7"></rect>
                                <rect data-name="사각형 3893" width="11" height="2" rx="1" transform="translate(1683 589)" fill="#a7b0c7"></rect>
                                <path data-name="패스 10531" d="M5.585 0H2.021A1.959 1.959 0 0 0 0 2.124v3.358a1.957 1.957 0 0 0 2.021 2.124h3.564a1.957 1.957 0 0 0 2.021-2.124V2.124A1.957 1.957 0 0 0 5.585 0z" transform="translate(1674 577)" fill="#a7b0c7" fill-rule="evenodd"></path>
                                <path data-name="패스 10532" d="M5.585 0H2.021A1.959 1.959 0 0 0 0 2.124v3.358a1.957 1.957 0 0 0 2.021 2.124h3.564a1.957 1.957 0 0 0 2.021-2.124V2.124A1.957 1.957 0 0 0 5.585 0z" transform="translate(1674 586)" fill="#a7b0c7" fill-rule="evenodd"></path>
                            </g>
                        </svg>
                    </button>
                </div>
                <div className="section-row">
                    <div className="combo-wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" 
                        width="30" height="30" viewBox="0 0 30 30">
                            <g data-name="그룹 10907">
                                <path data-name="패스 10510" 
                                d="M5.585 0H2.021A1.959 1.959 0 0 0 0 2.124v3.358a1.957 1.957 0 0 0 2.021 2.124h3.564a1.957 1.957 0 0 0 2.021-2.124V2.124A1.957 1.957 0 0 0 5.585 0z" 
                                transform="translate(6 6)" 
                                stroke="#a7b0c7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2px" 
                                fill-rule="evenodd" fill="none"></path>
                                <path data-name="패스 10513" 
                                d="M5.585 0H2.021A1.959 1.959 0 0 0 0 2.124v3.358a1.957 1.957 0 0 0 2.021 2.124h3.564a1.957 1.957 0 0 0 2.021-2.124V2.124A1.957 1.957 0 0 0 5.585 0z" 
                                transform="translate(6 16.394)" 
                                stroke="#a7b0c7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2px" 
                                fill-rule="evenodd" fill="none"></path>
                                <path data-name="패스 10511" d="M5.585 0H2.021A1.959 1.959 0 0 0 0 2.124v3.358a1.957 1.957 0 0 0 2.021 2.124h3.564a1.957 1.957 0 0 0 2.021-2.124V2.124A1.957 1.957 0 0 0 5.585 0z" 
                                transform="translate(16.394 6)" 
                                stroke="#a7b0c7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2px" 
                                fill-rule="evenodd" fill="none"></path>
                                <path data-name="패스 10512" 
                                d="M5.585 0H2.021A1.959 1.959 0 0 0 0 2.124v3.358a1.957 1.957 0 0 0 2.021 2.124h3.564a1.957 1.957 0 0 0 2.021-2.124V2.124A1.957 1.957 0 0 0 5.585 0z" 
                                transform="translate(16.394 16.394)" 
                                stroke="#a7b0c7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2px" 
                                fill-rule="evenodd" fill="none"></path></g>
                                <path data-name="사각형 3824" fill="none" d="M0 0h30v30H0z"></path></svg>
                        <ComboInput
                            // label="페이지 수"
                            options={["30개", "50개", "100개", "500개"]}
                            value={pageSize}
                            onChange={setPageSize}
                        />
                    </div>
                </div>
            </div>
        </div >
    );
}