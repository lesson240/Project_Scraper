import React, { useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
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
    { path: "/upload", icon: <FaList />, label: "상품 등록" },
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
    const isMobile = window.innerWidth <= 768;

    useEffect(() => {
        startAnimation();
    }, [open]);

    return (
        <>
            <aside
                className={`sidebar ${open ? "open" : "collapsed"} ${isAnimating ? "animating" : ""} ${isMobile ? "mobile" : ""}`}
                onAnimationEnd={() => {
                    if (!open) stopAnimation();
                }}
            >
                {!isMobile || open ? (
                    <>
                        {/* 상단 로고 및 토글 */}
                        <div className="sidebar-header">
                            <div className="sidebar-logo">
                                <Link to="/">
                                    <img src="logo.png" alt="logo" />
                                </Link>
                            </div>

                            <div className="sidebar-toggle-wrapper">
                                <button
                                    className="sidebar-close-icon"
                                    onClick={onClose}
                                    aria-label={open ? "사이드바 닫기" : "사이드바 열기"}
                                    title={open ? "사이드바 닫기" : "사이드바 열기"}
                                >
                                    <PiSidebarSimpleDuotone size={18} />
                                </button>
                            </div>
                        </div>
                        {/* 네비게이션 메뉴 */}
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

                        {/* 하단 아이콘 링크 */}
                        <div className="sidebar-footer">
                            <a
                                href="https://youtube.com" target="_blank" rel="noreferrer"
                                className="sidebar-footer-icon" title="YouTube"
                            >
                                <img
                                    src="/src/assets/images/sidebar/youtubeIconRed.png"
                                    alt="유튜브"
                                    className="footer-icon-img default" />
                                <img
                                    src="/src/assets/images/sidebar/youtubeIconWhite.png"
                                    alt="유튜브-hover"
                                    className="footer-icon-img hover" />
                            </a>
                            <a
                                href="https://cafe.naver.com" target="_blank" rel="noreferrer"
                                className="sidebar-footer-icon naver-icon" title="NaverCafe"
                            >
                                <img src="/src/assets/images/sidebar/naverIconGreen.png"
                                    alt="logo"
                                    className="footer-icon-img default" />
                                <img src="/src/assets/images/sidebar/naverIconWhite.png"
                                    alt="logo"
                                    className="footer-icon-img hover" />

                            </a>
                        </div>
                    </>
                ) : null}
            </aside >
            {/* 모바일일 때만 오버레이 적용 */}
            {isMobile && open && <div className="sidebar-overlay" onClick={onClose} />}
        </>
    );
}

