import React from "react";
import "@/styles/collect/textInput.css";

type Props = {
    value: string;
    onChange: (value: string) => void;
};

export default function TextInput({ value, onChange }: Props) {
    return (
        <div className="input-box">
            <div className="input-group">
                <label htmlFor="url" className="input-label">
                    단일 상품 URL <span className="tooltip-icon">?</span>
                </label>
                <input
                    id="url"
                    type="text"
                    className="input-field"
                    placeholder="URL 주소를 입력해주세요"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        </div>
    );
}