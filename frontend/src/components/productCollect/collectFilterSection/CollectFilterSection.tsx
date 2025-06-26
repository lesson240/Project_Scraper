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
    const [groupType, setGroupType] = useState("카테고리1");
    const [url, setUrl] = useState("");
    const [memo, setMemo] = useState("");

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
                    value={groupName}
                    onChange={setGroupName}
                />
                <ComboInput
                    label="대표 옵션"
                    options={["옵션1", "옵션2", "옵션3", "옵션4"]}
                    value={groupName}
                    onChange={setGroupName}
                />
                <ComboInput
                    label="증복 상품 처리"
                    options={["건너뛰기", "업데이트"]}
                    value={groupName}
                    onChange={setGroupName}
                />
                {/* <FilterButtons /> */}
            </div>
            <div className="section-row">

                <div className="section-row">
                    <TextInput value={url} onChange={setUrl} />

                </div>
            </div>
        </div>
    );
}
