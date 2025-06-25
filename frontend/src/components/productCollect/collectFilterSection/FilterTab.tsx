// components/ProductCollect/FilterTab.tsx
import React from "react";
import "@/styles/collect/filtertab.css";

type TabProps = {
    active: string;
    onChange: (tab: string) => void;
};

export default function FilterTab({ active, onChange }: TabProps) {
    return (
        <div className="filter-tab-wrapper">
            <button
                className={`filter-tab-btn ${active === "bulk" ? "active" : ""}`}
                onClick={() => onChange("bulk")}
            >
                대량 수집
            </button>
            <button
                className={`filter-tab-btn ${active === "single" ? "active" : ""}`}
                onClick={() => onChange("single")}
            >
                단일 수집
            </button>
        </div>
    );
}
