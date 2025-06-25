// hooks/useTab.ts
import { useState } from "react";

export function useTab<T extends string>(initialTab: T, tabs: T[]) {
    const [activeTab, setActiveTab] = useState<T>(initialTab);

    const changeTab = (tab: T) => {
        if (tabs.includes(tab)) setActiveTab(tab);
    };

    return { activeTab, changeTab };
}
