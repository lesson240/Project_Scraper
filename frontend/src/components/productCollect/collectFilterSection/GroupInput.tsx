import React from "react";
import "@/styles/collect/GroupInput.css";

type Props = {
    value: string;
    onChange: (value: string) => void;
};

export default function GroupInput({ value, onChange }: Props) {
    return (
        <div className="input-group">
            <label>상품 그룹명</label>
            <input
                type="text"
                placeholder="상품 그룹명을 입력해주세요"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
