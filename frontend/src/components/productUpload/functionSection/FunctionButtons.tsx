import React, { useState } from "react";
import Button from "@/components/common/Button";
import ComboInput from "../../common/ComboInput"
import "@/styles/collect/filterButtons.css";
import "@/styles/section.css"
import "@/styles/upload/layoutToggle.css"


type Props = {
    onPriceSet: () => void;
    onTagSet: () => void;
    onDetailPageSet: () => void;
    onGoodsNameSet: () => void;
    onSalesRegistrationSet: () => void;
    onGoodsDeleteSet: () => void;
};

export default function FunctionButtons({
    onPriceSet,
    onTagSet,
    onDetailPageSet,
    onGoodsNameSet,
    onSalesRegistrationSet,
    onGoodsDeleteSet
}: Props) {

    const [pageSize, setPageSize] = useState("30개");
    const handleReset = () => {
        setPageSize("30개");
    };
    const [layout, setLayout] = useState<"grid" | "list">("grid");
    const isGrid = layout === "grid";



    return (
        <div className="button-box">
            <div className="section-row">
                <Button variant="secondary" onClick={onPriceSet}>가격 설정</Button>
                <Button variant="secondary" onClick={onTagSet}>태그 설정</Button>
                <Button variant="secondary" onClick={onDetailPageSet}>상세페이지 설정</Button>
                <Button variant="secondary" onClick={onGoodsNameSet}>상품명 설정</Button>
                <Button variant="third-rate" onClick={onSalesRegistrationSet}>판매 등록</Button>
                <Button variant="sixth" onClick={onGoodsDeleteSet}>상품 삭제</Button>
                <div className="toggle-wrapper">
                    <button
                        className={`toggle-button-left ${isGrid ? "active" : ""}`}
                        onClick={() => setLayout("grid")}
                    >
                        <i className="icon-grid" />
                    </button>
                    <button
                        className={`toggle-button-right ${!isGrid ? "active" : ""}`}
                        onClick={() => setLayout("list")}
                    >
                        <i className="icon-list" />
                    </button>
                </div>
                <div className="section-row">
                    <ComboInput
                        // label="페이지 수"
                        options={["30개", "50개", "100개", "500개"]}
                        value={pageSize}
                        onChange={setPageSize}
                    />
                </div>
            </div>
        </div >
    );
}