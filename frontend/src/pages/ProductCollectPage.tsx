import React from "react";
import CollectFilterSection from "@/components/productCollect/collectFilterSection/CollectFilterSection";
import CollectResultSection from "@/components/productCollect/collectResultSection/CollectResultSection";

import "@/styles/section.css"

export default function DashboardPage() {
    return (
        <div>
            <div className="columns-auto-fit-large">
                <CollectFilterSection />
            </div>
            <div className="columns-auto-fit">
                <CollectResultSection />
                {/* ...다른 섹션들 */}
            </div>

        </div>
    );
}
