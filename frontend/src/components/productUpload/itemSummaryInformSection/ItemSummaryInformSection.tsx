// 상품관리 - 요약/리스트 영역 컴포넌트
// [설명] 상품 목록(간단 테이블) 렌더링

import React, { useState } from "react";
import "@/styles/upload/itemSummaryInformSection.css";
import TextInput from "@/components/common/TextInput";
import Button from "@/components/common/Button";
import testImg from "@/assets/images/test.jpg";
import testImg2 from "@/assets/images/test2.jpg";

/**
 * 상품 리스트/요약 테이블
 * - 상품 썸네일, 이름, 기능 버튼, 상세정보 등 표시
 * - 실데이터 바인딩 전까지는 예시로 구현
 */



const sampleData = [
    {
        id: 1,
        image: testImg,
        title: "다프네 두꺼운 밑창 헬시 숏 부츠 여성 가을 겨울용 벨벳...",
        memo: "",
        market: "Taobao",
        collectDate: "2025-10-07",
        priceRange: "429 ~ 429",
        tags: [],
        priceRequired: true,
        tagRequired: true,
    },
    {
        id: 2,
        image: testImg2,
        title: "여성용 찰시 숏 부츠 2024년 신상품 울매치 레트로...",
        memo: "",
        market: "Taobao",
        collectDate: "2025-10-07",
        priceRange: "163 ~ 163",
        tags: [],
        priceRequired: true,
        tagRequired: true,
    },
];

type Props = {
    onAttributeSet: () => void;
    onOptionSet: () => void;
    onDetailPageSet: () => void;
    onUploadSet: () => void;
};


export default function ItemSummaryInformSection({
    onAttributeSet,
    onOptionSet,
    onDetailPageSet,
    onUploadSet
}: Props) {
    const [goodsName, setGoodsName] = useState("");

    const handleInput = () => {
        const params = {
            goodsName,
        };
    }

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
    

const [items, setItems] = useState(sampleData); // sampleData는 상품 리스트

const handleTitleChange = (id: number, value: string) => {
  const updated = items.map((item) =>
    item.id === id ? { ...item, title: value } : item
  );
  setItems(updated);
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

            {items.map((item) => (
                <div key={item.id} className="table-row">
                    <div className="table-col ">
                        <input type="checkbox" /></div>
                    <div className="market-label">Taobao</div>
                <div className="table-col-left">
                    <img src={item.image} alt="상품 썸네일" className="thumb" />
                    <div className="goods-details">
                        <div className="goods-title">
                            <TextInput
                                value={item.title}
                                onChange={(val) => handleTitleChange(item.id, val)}
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
                        <div className="basic-info">상품 수집일: {item.collectDate}</div>
                        <div className="basic-info">원본 할인가 (¥): {item.priceRange}</div>
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