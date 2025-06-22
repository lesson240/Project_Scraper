import React from "react";
import { NavLink } from "react-router-dom";
import useToggle from "@/hooks/useToggle";
import useAnimation from "@/hooks/useAnimation";
import { FaHome, FaBoxOpen, FaList, FaShoppingCart, FaCog, FaCoins, FaQuestionCircle, FaUserShield } from "react-icons/fa";
import "@/styles/sidebar.css"

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

export default function Sidebar() {
    const { state:open, open: openSidebar, close: closeSidebar } = useToggle(false);
    const { isAnimating, start: startAnimation, stop: stopAnimation } = useAnimation(false);

    const handleOpen = () => {
        openSidebar();
        startAnimation();
    };

    // 닫을 때 애니메이션 먼저 -> 닫기
    const handleClose = () => {
        stopAnimation();
        setTimeout(closeSidebar, 300); //CSS 트랜지션 시간과 맞춤
    }

    return (
        <>
            <button className="sidebar-toggle-btn" onClick={handleOpen}>메뉴</button>
            <aside
                className={'sidebar ${open ? "open" : ""} ${isAnimating ? "animating" : ""}'}
                onAnimationEnd={() => { if (!open) stopAnimation(); }}
            >
                <button className="sidebar-close-btn" onClick={handleClose}>닫기</button>
                <div className="sidebar-logo">
                    <img src="/logo.svg" alt="로고" />
                </div>
                <nav>
                    {menu.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className="sidebar-link"
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <a href="https://youtube.com" target="_blank" rel="noreferrer">유튜브</a>
                    <a href="https://cafe.naver.com" target="_blank" rel="noreferrer">카페</a>
                </div>
            </aside>
            {/* 오버레이 */}
            {open && <div className="sidebar-overlay" onClick={handleClose} />}
        </>
    );
}

// export default function Sidebar() {
//     return (
//         <aside className="h-screen w-60 bg-yellow-400 flex flex-col p-4 fixed left-0 top-0">
//             <div className="mb-8">
//                 {/* 로고 자리 */}
//                 <img src="/logo.svg" alt="로고" className="h-16 mb-6" />
//             </div>
//             <nav className="flex-1 space-y-2">
//                 {menu.map((item) => (
//                     <NavLink
//                         key={item.path}
//                         to={item.path}
//                         className="flex items-center gap-3 p-3 rounded hover:bg-yellow-300 font-semibold"
//                         style={({ isActive }) => ({
//                             background: isActive ? "#fff7d6" : "transparent",
//                             color: isActive ? "#222" : "#884d00",
//                         })}
//                     >
//                         <span>{item.icon}</span>
//                         {item.label}
//                     </NavLink>
//                 ))}
//             </nav>
//             <div className="mt-auto flex gap-2">
//                 {/* 유튜브/카페 버튼 예시 */}
//                 <a href="https://youtube.com" target="_blank" className="flex-1 bg-white rounded p-2 text-center font-bold text-red-500">유튜브</a>
//                 <a href="https://cafe.naver.com" target="_blank" className="flex-1 bg-white rounded p-2 text-center font-bold text-green-600">카페</a>
//             </div>
//         </aside>
//     );
// }
