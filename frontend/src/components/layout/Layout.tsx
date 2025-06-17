import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <Sidebar />
            <div className="ml-60 min-h-screen bg-gray-50">
                <Header />
                <main className="p-8">{children}</main>
            </div>
        </div>
    );
}
