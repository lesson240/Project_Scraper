import React, { useState, useRef, useEffect } from "react";
import "@/styles/common/comboInput.css";

type Props = {
    label: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
};

export default function ComboInput({ label, options, value, onChange }: Props) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (item: string) => {
        onChange(item);
        setOpen(false);
    };

    return (
        <div className="combo-input-group" ref={wrapperRef}>
            <label className="combo-label">{label}</label>
            <div className="combo-box">
                <div className="combo-box-selected" onClick={() => setOpen((prev) => !prev)}>
                    {value}
                </div>
                <button
                    type="button"
                    className="combo-box-icon"
                    onClick={() => setOpen((prev) => !prev)}
                    aria-label="드롭다운 열기"
                />
            </div>

            {open && (
                <ul className="combo-box-dropdown">
                    {options.map((opt, idx) => (
                        <li key={idx} onClick={() => handleSelect(opt)}>
                            {opt}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
