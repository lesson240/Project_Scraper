// components/productCollect/collectFilterSection/ComboTextInput.tsx
import React, { useState, useRef, useEffect } from "react";
import "@/styles/collect/comboTextInput.css";

type Props = {
    label: string;
    value: string;
    onChange: (value: string) => void;
};

const DUMMY_OPTIONS = ["헬스케어", "주방용품", "패션잡화", "카테고리1", "기타"];

export default function ComboTextInput({ label, value, onChange }: Props) {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (item: string) => {
        onChange(item);
        setDropdownOpen(false);
    };

    return (
        <div className="combo-text-wrapper" ref={wrapperRef}>
            <label className="combo-text-label">{label}</label>
            <div className="combo-text-input-box">
                <input
                    type="text"
                    className="combo-text-input"
                    placeholder={`${label}을 입력해주세요`}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
                <button
                    type="button"
                    className="combo-text-icon"
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    aria-label="드롭다운 열기"
                >
                </button>
            </div>

            {isDropdownOpen && (
                <ul className="combo-dropdown">
                    {DUMMY_OPTIONS.map((item) => (
                        <li key={item} onClick={() => handleSelect(item)}>
                            {item}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
