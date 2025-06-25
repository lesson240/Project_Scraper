// Header.tsx
import React, { useRef, useEffect, useState } from "react";
import { FaBell, FaUser } from "react-icons/fa";
import "@/styles/header.css";

type HeaderProps = {
    isSidebarOpen: boolean;
    onToggleSidebar: () => void;
};

export default function Header({ isSidebarOpen, onToggleSidebar }: { isSidebarOpen: boolean; onToggleSidebar: () => void }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false); // 외부 클릭 시 닫힘
            }
        }

        if (dropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownOpen]);

    return (
        <header className="header">
            <div className="greeting">안녕하세요, 유성용님!</div>

            <div className="header-icons">
                <FaBell className="icon" />
                <div className="dropdown-wrapper" ref={dropdownRef}>
                    <FaUser className="icon" onClick={() => setDropdownOpen(!dropdownOpen)} />
                    {dropdownOpen && (
                        <div className="dropdown-menu">
                            <button className="dropdown-item">계정정보</button>
                            <button className="dropdown-item">추천인 입력</button>
                            <button className="dropdown-item">결제하기</button>
                            <button className="dropdown-item">결제내역</button>
                            <button className="dropdown-item">문의사항</button>
                            <button className="dropdown-item">로그아웃</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
