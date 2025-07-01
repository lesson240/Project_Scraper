import React, { useState } from "react";
import axios from "@/lib/axios";
import ComboTextInput from "../../common/ComboTextInput"
import TextInput from "../../common/TextInput";
import MemoSelect from "../../productCollect/collectFilterSection/MemoSelect";
import ComboInput from "../../common/ComboInput"
import FilterButtons from "../../productCollect/collectFilterSection/FilterButtons";
import "@/styles/section.css";
import { ProductCode } from "../uploadSearching/parts/ProductCode";

export default function FilterSection() {
    const [groupName, setGroupName] = useState("");
    const [goodsName, setGoodsName] = useState("");
    const [memo, setMemo] = useState("");
    const [brand, setBrand] = useState("");
    const [unUploadedMarket, setUnUploadMarket] = useState("");
    const [collectJopNumber, setCollectJopNumber] = useState("");
    const [uploadJopNumber, setUploadJopNumber] = useState("");
    const [goodsCode, setGoodsCode] = useState("");
    const [calendarStartDate, setCalendarStartDate] = useState("");
    const [calendarEndDate, setCalendarEndDate] = useState("");
    const [promotionDateRate, setPromotionDateRate] = useState("");
    const [soldOut, setsSoldOut] = useState("");
    const [filteType, setFilterType] = useState(""); //어떤 버튼을 눌렀는지 추적

    const handleReset = () => {
        setGroupName("");
        setMemo("");
        setGoodsName("");
        setBrand("");
        setUnUploadMarket("");
        setCollectJopNumber("");
        setUploadJopNumber("");
        setGoodsCode("");
        setCalendarEndDate("");
        setCalendarStartDate("");
        setPromotionDateRate("");
        setsSoldOut("");
    };

    const handleSearch = () => {
        const params = {
            groupName,
            memo,
            goodsName,
            brand,
            unUploadedMarket,
            collectJopNumber,
            uploadJopNumber,
            goodsCode,
            calendarStartDate,
            calendarEndDate,
            promotionDateRate,
            soldOut,
        };
        console.log("검색 요청 데이터:", params);

        // TODO: 여기에 fetch or axios POST 호출 (backend 연동)
        // await axios.post('/api/collect/search', params)
    };

    //   const handleSpecialToday = async () => {
    //     const params = {
    //       group_name : groupName,
    //       memo : memo,
    //       redundant : duplication,
    //     };

    //     console.log("오특 요청 데이터:", params);

    //     try {
    //         const res = await axios.post('/collect/specialtoday', params);
    //         console.log("오특 결과 수신됨: res.data");
    //         setFilterType("special");
    //     } catch (err) {
    //         console.error("오특 API 호출 실패", err);
    //     }    
    //   }; 

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
                <ComboTextInput
                    label="브랜드"
                    value={brand}
                    onChange={setBrand} />
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
                    onCollect={handleReset}
                    onSpecialToday={handleReset} />
            </div>
        </div>
    );
}
