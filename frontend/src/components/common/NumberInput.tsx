// src/components/common/NumberInput.tsx
import React from "react";
import "@/styles/common/numberInput.css";

type Props = {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    label?: string;
};

export default function NumberInput({
    value,
    onChange,
    min = 0,
    max = 999999,
    step = 1,
    placeholder,
    disabled = false,
    className = "",
    label
}: Props) {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(e.target.value);
        if (!isNaN(newValue)) {
            onChange(newValue);
        }
    };

    const handleArrowUp = () => {
        const newValue = Math.min(max, value + step);
        onChange(newValue);
    };

    const handleArrowDown = () => {
        const newValue = Math.max(min, value - step);
        onChange(newValue);
    };

    return (
        <div className={`number-input-container ${className}`}>
            {label && <label className="number-input-label">{label}</label>}
            <div className="number-input-wrapper">
                <input
                    type="number"
                    value={value}
                    onChange={handleInputChange}
                    min={min}
                    max={max}
                    step={step}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="number-input-field"
                />
                <div className="number-input-arrows">
                    <button
                        type="button"
                        className="arrow-up"
                        onClick={handleArrowUp}
                        disabled={disabled || value >= max}
                        title={`${step} 증가`}
                    >
                        ▲
                    </button>
                    <button
                        type="button"
                        className="arrow-down"
                        onClick={handleArrowDown}
                        disabled={disabled || value <= min}
                        title={`${step} 감소`}
                    >
                        ▼
                    </button>
                </div>
            </div>
        </div>
    );
}
