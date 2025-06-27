// components/productCollect/collectFilterSection/FilterSection.tsx
import React, { useState } from "react";
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

                <div className="section-row">
                    <ComboTextInput
                        label="브랜드"
                        value={brand}
                        onChange={setBrand} />

                </div>
            </div>
        </div>
    );
}
