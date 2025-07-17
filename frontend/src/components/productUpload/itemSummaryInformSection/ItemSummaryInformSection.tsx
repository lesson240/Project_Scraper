import React, { useState } from "react";
import "@/styles/upload/itemSummaryInformSection.css";
import TextInput from "@/components/common/TextInput";
import Button from "@/components/common/Button";
import testImg from "@/assets/images/test.jpg";
import testImg2 from "@/assets/images/test2.jpg";

type Item = {
    origin_goods_name: string;
    goods_origin: number;
    thumb?: {
        thumb1?: string;
    };
    market: string;
    collection_time?: string;
    priceRange?: string;
    priceRequired?: boolean;
    tagRequired?: boolean;
    origin_goods_code?: string;
};


type Props = {
    items?: Item[];
    onAttributeSet: () => void;
    onOptionSet: () => void;
    onDetailPageSet: () => void;
    onUploadSet: () => void;
};



export default function ItemSummaryInformSection({
    items = [],
    onAttributeSet,
    onOptionSet,
    onDetailPageSet,
    onUploadSet
}: Props) {
    if (!Array.isArray(items) || items.length === 0) {
        return <div style={{ padding: "20px" }}>데이터가 없습니다.</div>;
    }
    const handleTitleChange = (id: string | undefined, value: string) => {
        console.log(`변경된 제목(${id}):`, value);
        // 추후 개별 수정 API 연동 시 사용
    };

    const handleAttributeSet = () => {
        console.log("속성 설정 API 호출 예정");
    };
    const handleOptionSet = () => {
        console.log("속성 설정 API 호출 예정");
    };
    const handleDetailPageSet = () => {
        console.log("속성 설정 API 호출 예정");
    };
    const handleUploadLogSet = () => {
        console.log("속성 설정 API 호출 예정");
    };


    return (
        <div className="product-manage-table">
            <div className="table-head">
                <div className="table-col ">
                    <input type="checkbox" /></div>
                <div className="table-col">수집 마켓</div>
                <div className="table-col">상품정보</div>
                <div className="table-col">기능</div>
                <div className="table-col">상세정보</div>
            </div>

            {items.map((item, index) => (
                <div key={item.origin_goods_code || `fallback-${index}`} className="table-row">
                    <div className="table-col ">
                        <input type="checkbox" /></div>
                    <div className="market-label">{item.market}</div>
                    <div className="table-col-left">
                        <img
                            src={item.thumb?.thumb1 || "/images/default-thumb.jpg"}
                            alt="상품 썸네일"
                            className="thumb"
                        />
                        <div className="goods-details">
                            <div className="goods-title">
                                <TextInput
                                    value={item.origin_goods_name}
                                    onChange={(val) => handleTitleChange(item.origin_goods_code, val)}
                                    showTooltip={false}
                                    className="full-width"
                                /></div>
                            <div className="meta">메모를 입력해주세요</div>
                            <div className="meta">업로드 마켓: {item.market}</div>
                        </div>
                    </div>
                    <div className="table-col button-group">
                        <div className="button-row">
                            <Button variant="secondary" onClick={onAttributeSet}>속성</Button>
                            <Button variant="secondary" onClick={onOptionSet}>옵션</Button>
                        </div>
                        <div className="button-row">
                            <Button variant="secondary" onClick={onDetailPageSet}>상세페이지</Button>
                            <Button variant="secondary" onClick={onUploadSet}>업로드 로그</Button>
                        </div>
                    </div>
                    <div className="table-col detail-col">
                        <div className="basic-info">상품 수집일: {item.collection_time}</div>
                        <div className="basic-info">원본 할인가 (¥): {item.goods_origin}</div>
                        <div className="basic-info">설정 상품가 (￦): {item.priceRange}</div>
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