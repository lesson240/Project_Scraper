import React from "react";
import UserInformSection from "../components/dashboard/userInformSection/UserInformSection";
import AdSection from "../components/dashboard/adSection/AdSection";
import NoticeSection from "../components/dashboard/noticeSection/NoticeSection";
import SummarySection from "../components/dashboard/summarySection/SummarySection";
import ChartSection from "../components/dashboard/chartSection/ChartSection";


export default function DashboardPage() {
    return (
        <div>
            <UserInformSection />
            <AdSection />
            <NoticeSection />
            <SummarySection />
            <ChartSection />
            {/* ...다른 섹션들 */}
        </div>
    );
}
