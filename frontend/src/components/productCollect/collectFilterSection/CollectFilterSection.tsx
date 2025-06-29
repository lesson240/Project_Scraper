// components/productCollect/collectFilterSection/FilterSection.tsx
import React, { useState } from "react";
import axios from "@/lib/axios";
import ComboTextInput from "./ComboTextInput"
import TextInput from "./TextInput";
import MemoSelect from "./MemoSelect";
import ComboInput from "./ComboInput"
import FilterButtons from "./FilterButtons";
import "@/styles/section.css";

export default function FilterSection() {
    const [groupName, setGroupName] = useState("");
    const [memo, setMemo] = useState("");
    const [thumbOption, setThumbOption] = useState("옵션1");
    const [duplication, setDuplication] = useState("건너뛰기");
    const [brand, setBrand] = useState("");
    const [filteType, setFilterType] = useState(""); //어떤 버튼을 눌렀는지 추적

  const handleReset = () => {
    setGroupName("");
    setMemo("");
    setThumbOption("옵션1");
    setDuplication("건너뛰기");
    setBrand("");
  };

  const handleCollect = () => {
    const params = {
      groupName,
      memo,
      thumbOption,
      duplication,
      brand,
    };
    console.log("검색 요청 데이터:", params);

    // TODO: 여기에 fetch or axios POST 호출 (backend 연동)
    // await axios.post('/api/collect/search', params)
  };

  const handleSpecialToday = async () => {
    const params = {
      group_name : groupName,
      memo : memo,
      redundant : duplication,
    };

    console.log("오특 요청 데이터:", params);

    try {
        const res = await axios.post('/collect/specialtoday', params);
        console.log("오특 결과 수신됨: res.data");
        setFilterType("special");
    } catch (err) {
        console.error("오특 API 호출 실패", err);
    }    
  }; 
    
    return (
        <div className="section-block">
            <div className="section-row">
                {/* <section className="section-head"><h2>수집결과</h2></section> */}
                <ComboTextInput
                    label="상품 그룹명"
                    value={groupName}
                    onChange={setGroupName}
                />
                <MemoSelect
                    label="메모"
                    value={memo}
                    onChange={setMemo}
                />
                <ComboInput
                    label="썸네일 대표 옵션"
                    options={["옵션1", "옵션2", "옵션3", "옵션4"]}
                    value={thumbOption}
                    onChange={setThumbOption}
                />
                <ComboInput
                    label="증복 상품 처리"
                    options={["건너뛰기", "업데이트"]}
                    value={duplication}
                    onChange={setDuplication}
                />
            </div>
            <div className="section-row">
                    <ComboTextInput
                        label="브랜드"
                        value={brand}
                        onChange={setBrand} />
            </div>
            <div>
        <FilterButtons
          onReset={handleReset}
          onCollect={handleCollect}
          onSpecialToday={handleSpecialToday} />
                </div>
        </div>
    );
}
