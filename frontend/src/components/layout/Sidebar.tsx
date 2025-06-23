import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import useAnimation from "@/hooks/useAnimation";
import {
    FaHome,
    FaBoxOpen,
    FaList,
    FaShoppingCart,
    FaCog,
    FaCoins,
    FaQuestionCircle,
    FaUserShield,
} from "react-icons/fa";
import { PiSidebarSimpleDuotone } from "react-icons/pi";
import "@/styles/sidebar.css";

const menu = [
    { path: "/", icon: <FaHome />, label: "홈" },
    { path: "/collect", icon: <FaBoxOpen />, label: "상품 수집" },
    { path: "/register", icon: <FaList />, label: "상품 등록" },
    { path: "/manage", icon: <FaShoppingCart />, label: "상품 관리" },
    { path: "/order", icon: <FaShoppingCart />, label: "주문 관리" },
    { path: "/settings", icon: <FaCog />, label: "기본 설정" },
    { path: "/coin", icon: <FaCoins />, label: "코인 충전소" },
    { path: "/guide", icon: <FaQuestionCircle />, label: "사용가이드" },
    { path: "/admin", icon: <FaUserShield />, label: "관리자" },
];

type Props = {
    open: boolean;
    onClose: () => void;
};

export default function Sidebar({ open, onClose }: Props) {
    const { isAnimating, start: startAnimation, stop: stopAnimation } = useAnimation(false);

    useEffect(() => {
        startAnimation();
    }, [open]);

    return (
        <>
            <aside
                className={`sidebar ${open ? "open" : "collapsed"} ${isAnimating ? "animating" : ""}`}
                onAnimationEnd={() => {
                    if (!open) stopAnimation();
                }}
            >
                <div className="sidebar-header">
                    <img src="/logo.svg" className="sidebar-logo" />
                    <button className="sidebar-close-icon" onClick={onClose}>
                        <PiSidebarSimpleDuotone size={18} />
                    </button>
                </div>

                <nav>
                    {menu.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
                            }
                        >
                            <span className="icon-wrapper">{item.icon}</span>
                            <span className="text-wrapper">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <a href="https://youtube.com" target="_blank" rel="noreferrer">
                        유튜브
                    </a>
                    <a href="https://cafe.naver.com" target="_blank" rel="noreferrer">
                        카페
                    </a>
                </div>
            </aside>

            {open && <div className="sidebar-overlay" onClick={onClose} />}
        </>
    );
}
