import React from "react";
import { PiSidebarSimpleDuotone } from "react-icons/pi"; // React Icon 예시 (자유롭게 교체 가능)
import "@/styles/sidebarToggleButton.css";

type Props = {
    isOpen: boolean;
    onClick: () => void;
};

export default function SidebarToggleButton({ isOpen, onClick }: Props) {
    return (
        <button
            onClick={onClick}
            className="sidebar-close-icon"
            title={isOpen ? '사이드바 닫기' : '사이드바 열기'}
        >
            <PiSidebarSimpleDuotone size={24} />
        </button>
    );
}