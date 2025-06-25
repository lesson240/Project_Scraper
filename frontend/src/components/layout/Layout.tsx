// src/components/layout/Layout.tsx
import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import useToggle from "@/hooks/useToggle";
import "@/styles/layout.css";

export default function Layout({ children }: { children: React.ReactNode }) {
    const { state: isSidebarOpen, toggle: toggleSidebar } = useToggle(true);

    return (
        <div className={`layout-wrapper ${isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
            <Sidebar open={isSidebarOpen} onClose={toggleSidebar} />
            <div className="layout-content">
                <Header isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
                <main className="main-content">{children}</main>
            </div>
        </div>
    );
}
