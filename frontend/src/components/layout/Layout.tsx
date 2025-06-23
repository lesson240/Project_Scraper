import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import useToggle from "@/hooks/useToggle";

export default function Layout({ children }: { children: React.ReactNode }) {
    const { state: isSidebarOpen, toggle: toggleSidebar } = useToggle(true);

    return (
        <div>
            <Sidebar open={isSidebarOpen} onClose={toggleSidebar} />
            <div className={`min-h-screen bg-gray-50 transition-all duration-300 ${isSidebarOpen ? "ml-60" : "ml-0"}`}>
                <Header isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
                <main className="p-8">{children}</main>
            </div>
        </div>
    );
}
