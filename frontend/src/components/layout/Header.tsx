import React from "react";

export default function Header() {
    return (
        <header className="h-16 flex items-center justify-between px-8 bg-white shadow-sm ml-60">
            <div className="font-bold text-xl">안녕하세요, 한지우님!</div>
            {/* 현재는 하드코딩된 "안녕하세요, 한지우님!" → props로 변경하거나 추후 Context, Redux, Zustand 등 상태관리 연동 권장 */}
            {/* 우측 유저 프로필/알림 등 나올 공간은 주석처리로 남겼으니, 향후 UserMenu, NotificationIcon 등 별도 컴포넌트로 분리 가능*/}
            <div className="flex gap-4">
                {/* ... */}
            </div>
        </header>
    );
}
