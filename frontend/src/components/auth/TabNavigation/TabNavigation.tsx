// path: frontend/src/components/auth/TabNavigation/TabNavigation.tsx

import React from 'react';
import '@/styles/auth/TabNavigation/TabNavigation.css';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export default function TabNavigation({
  tabs,
  activeTab,
  onTabChange,
  className = ''
}: TabNavigationProps) {
  return (
    <div className={`auth-tabs ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`auth-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
          type="button"
        >
          {tab.icon && <span className="auth-tab-icon">{tab.icon}</span>}
          <span className="auth-tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
