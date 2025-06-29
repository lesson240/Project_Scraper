import React from "react";
import "@/styles/collect/textInput.css";

type Props = {
    label: string;
    value: string;
    onChange: (value: string) => void;
};

export default function TextInput({ label, value, onChange }: Props) {
    return (
        <div className="input-box">
            <div className="input-group">
                <label htmlFor="url" className="input-label">
                    {label} <span className="tooltip-icon">?</span>
                </label>
                <input
                    id="url"
                    type="text"
                    className="input-field"
                    placeholder={`${label}을 입력해주세요`}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        </div>
    );
}