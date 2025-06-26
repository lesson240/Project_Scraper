// components/productCollect/collectFilterSection/ComboInput.tsx
import React from "react";
import "@/styles/collect/comboInput.css";

type Props = {
    label: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
};

export default function ComboInput({ label, options, value, onChange }: Props) {
    return (
        <div className="combo-input-group">
            <label className="combo-label">
                {label}
                <span className="tooltip-icon">?</span>
            </label>
            <select
                className="combo-select"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="" disabled>
                    {label}을 입력해주세요
                </option>
                {options.map((opt, idx) => (
                    <option key={idx} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        </div>
    );
}
