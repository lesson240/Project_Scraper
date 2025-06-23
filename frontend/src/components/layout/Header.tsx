import React from "react";
import SidebarToggleButton from "./SidebarToggleButton";

type Props = {
    isSidebarOpen: boolean;
    onToggleSidebar: () => void;
};

export default function Header({ isSidebarOpen, onToggleSidebar }: Props) {
    return (
        <header className="h-16 flex items-center justify-between px-8 bg-white shadow-sm">
            <SidebarToggleButton isOpen={isSidebarOpen} onClick={onToggleSidebar} />
            <div className="font-bold text-xl">안녕하세요, 한지우님!</div>
            <div className="flex gap-4" />
        </header>
    );
}
