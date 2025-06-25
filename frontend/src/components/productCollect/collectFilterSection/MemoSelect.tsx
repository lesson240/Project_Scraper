// components/productCollect/collectFilterSection/MemoSelect.tsx
import React from "react";
import "@/styles/collect/MemoSelect.css";

type Props = {
    value: string;
    onChange: (value: string) => void;
};

export default function MemoSelect({ value, onChange }: Props) {
    return (
        <div className="memo-select-box">
            <label>메모</label>
            <select value={value} onChange={(e) => onChange(e.target.value)}>
                <option value="">메모를 입력해주세요</option>
                <option value="메모1">메모1</option>
                <option value="메모2">메모2</option>
            </select>
        </div>
    );
}
