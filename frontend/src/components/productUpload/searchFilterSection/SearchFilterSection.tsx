import React, { useState } from "react";
import axios from "@/lib/axios";
import ComboTextInput from "../../common/ComboTextInput"
import TextInput from "../../common/TextInput";
import MemoSelect from "../../productCollect/collectFilterSection/MemoSelect";
import ComboInput from "../../common/ComboInput"
import FilterButtons from "../../productUpload/searchFilterSection/FilterButtons";
import "@/styles/section.css";
import { ProductCode } from "../uploadSearching/parts/ProductCode";


type Props = {
    onSearchClick: (params: any) => void;
};

export default function FilterSection({ onSearchClick }: Props) {
    const [groupName, setGroupName] = useState("");
    const [goodsName, setGoodsName] = useState("");
    const [memo, setMemo] = useState("");
    const [brand, setBrand] = useState("");
    const [brandCode, setBrandCode] = useState("");
    const [unUploadedMarket, setUnUploadMarket] = useState("");
    const [collectJopNumber, setCollectJopNumber] = useState("");
    const [uploadJopNumber, setUploadJopNumber] = useState("");
    const [goodsCode, setGoodsCode] = useState("");
    const [calendarStartDate, setCalendarStartDate] = useState("");
    const [calendarEndDate, setCalendarEndDate] = useState("");
    const [promotionDateRate, setPromotionDateRate] = useState("");
    const [soldOut, setsSoldOut] = useState("판매");
    const [filteType, setFilterType] = useState(""); //어떤 버튼을 눌렀는지 추적

    const handleReset = () => {
        setGroupName("");
        setMemo("");
        setGoodsName("");
        setBrand("");
        setBrandCode("");
        setUnUploadMarket("");
        setCollectJopNumber("");
        setUploadJopNumber("");
        setGoodsCode("");
        setCalendarEndDate("");
        setCalendarStartDate("");
        setPromotionDateRate("");
        setsSoldOut("");
    };


    const handleClick = () => {
        const params = {
            group_name: groupName,
            memo_name: memo,
            modified_goods_name: goodsName,
            brand_name: brand,
            un_uploaded_market: unUploadedMarket,
            origin_goods_code: goodsCode,
            sold_out: soldOut,
            promotion_period: promotionDateRate,
        };
        onSearchClick(params);
    };

    // const handleSearch = async () => {
    //     const payload = {
    //         brand_name: brand || "",          // string
    //         brand_code: brandCode || "",      // string
    //         group_name: groupName || "",      // string
    //         memo_name: memo || "",            // string
    //         origin_goods_code: goodsCode || "",  // string
    //         origin_goods_name: goodsName || "",  // string
    //         promotion_period: promotionDateRate || "", // string
    //     };
    //     console.log("🔍 검색 요청 데이터:", payload);

    //     try {
    //         const res = await axios.post("/product-data", payload);
    //         console.log("📦 백엔드 응답:", res.data);
    //         onSearch(res.data.items); // ← itemSummaryInformSection 업데이트
    //     } catch (err) {
    //         console.error("❌ 조회 실패:", err);
    //     }
    // };


    return (
        <div className="section-block">
            <div className="section-row">
                <ComboTextInput
                    label="상품 그룹명"
                    value={groupName}
                    onChange={setGroupName}
                />
                <TextInput
                    label="상품명"
                    value={goodsName}
                    onChange={setGoodsName}
                />
                <MemoSelect
                    label="메모"
                    value={memo}
                    onChange={setMemo}
                />
                <ComboTextInput
                    label="브랜드"
                    value={brand}
                    onChange={setBrand}
                />
                <ComboInput
                    label="미업로드 마켓"
                    options={["스마트스토어", "쿠팡", "지마켓", "옥션"]}
                    value={unUploadedMarket}
                    onChange={setUnUploadMarket}
                />
            </div>
            <div className="section-row">
                <TextInput
                    label="수집 작업번호"
                    value={collectJopNumber}
                    onChange={setCollectJopNumber}
                />
                <TextInput
                    label="업로드 작업번호"
                    value={uploadJopNumber}
                    onChange={setUploadJopNumber}
                />
                <TextInput
                    label="상품 코드"
                    value={goodsCode}
                    onChange={setGoodsCode}
                />
                <ComboInput
                    label="품절 유무"
                    options={["품절", "판매"]}
                    value={soldOut}
                    onChange={setsSoldOut}
                />
            </div>
            <div>
                <FilterButtons
                    onReset={handleReset}
                    onPeriodset={handleReset}
                    onInquiry={handleClick} />
            </div>
        </div>
    );
}
