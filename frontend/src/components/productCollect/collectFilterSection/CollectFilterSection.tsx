// components/productCollect/collectFilterSection/FilterSection.tsx
import React, { useState } from "react";
import GroupInput from "./GroupInput";
import MemoSelect from "./MemoSelect";
import FilterButtons from "./FilterButtons";
import "@/styles/section.css";

export default function FilterSection() {
    const [groupName, setGroupName] = useState("");
    const [memo, setMemo] = useState("");

    return (
        <div className="section-block">
            <section className="section-head"><h2>수집결과</h2></section>
            <section className="section-body">
                <GroupInput value={groupName} onChange={setGroupName} />
                <MemoSelect value={memo} onChange={setMemo} />
                {/* <FilterButtons /> */}
            </section></div>
    );
}
