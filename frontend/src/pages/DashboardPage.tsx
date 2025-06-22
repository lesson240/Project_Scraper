import React from "react";
import UserInformSection from "../components/dashboard/userInformSection/UserInformSection";
import AdSection from "../components/dashboard/adSection/AdSection";
import NoticeSection from "../components/dashboard/noticeSection/NoticeSection";
import SummarySection from "../components/dashboard/summarySection/SummarySection";
import ChartSection from "../components/dashboard/chartSection/ChartSection";
import "@/styles/section.css"

export default function DashboardPage() {
    return (
        <div>
            <div className="columns-auto-fit-large">
            <UserInformSection /> 
            <AdSection />
            </div>
            <div className="columns-auto-fit">
            <NoticeSection />
            <SummarySection />
            <ChartSection />
            {/* ...다른 섹션들 */}
            </div>
            
        </div>
    );
}
