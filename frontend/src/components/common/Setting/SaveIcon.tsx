// path: frontend/src/components/common/Setting/SaveIcon.tsx
import React from 'react';
import Tooltip from '@/components/common/Tooltip';
import '@/styles/common/SaveIcon.css';

interface SaveIconProps {
  settingType: 'exchangeRate' | 'formulaAndMargin';
  onClick: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function SaveIcon({ 
  settingType, 
  onClick, 
  className = '', 
  size = 'md' 
}: SaveIconProps) {
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'save-icon--sm';
      case 'lg': return 'save-icon--lg';
      default: return 'save-icon--md';
    }
    };

  const getTooltipText = () => {
    switch (settingType) {
      case 'exchangeRate': return '환율 설정 기본값 저장';
      case 'formulaAndMargin': return '공식 및 마진 설정 기본값 저장';
      default: return '설정 저장';
    }
  };

  return (
    <Tooltip text={getTooltipText()}>
      <svg 
        onClick={onClick}
        viewBox="0 0 24 24" 
        fill="currentColor"
        className={`save-icon ${getSizeClass()} ${className}`}
      >
        <path d="M12,12c-3.314,0-6,2.686-6,6s2.686,6,6,6,6-2.686,6-6-2.686-6-6-6Zm2.932,5.459c-.136,.328-.456,.541-.812,.541h-1.121v3c0,.552-.447,1-1,1s-1-.448-1-1v-3h-1.121c-.355,0-.676-.213-.812-.541-.138-.329-.062-.706,.19-.957l1.5-1.5c.685-.685,1.8-.685,2.485,0l1.5,1.5c.168,.168,.257,.393,.257,.621,0,.113-.021,.227-.067,.336Zm9.068-4.962c0,2.909-1.668,5.431-4.095,6.674,.056-.383,.095-.772,.095-1.171,0-4.418-3.582-8-8-8s-8,3.582-8,8c0,.634,.082,1.248,.221,1.84-2.417-.579-4.221-2.752-4.221-5.344,0-1.546,.656-3.029,1.801-4.07,.273-.248,.405-.593,.346-.901-.184-.946-.195-1.919-.033-2.89C2.66,3.346,5.225,.734,8.497,.134c3.592-.661,7.183,1.167,8.735,4.438,.14,.296,.41,.503,.742,.569,3.492,.696,6.026,3.789,6.026,7.354Z"/>
      </svg>
    </Tooltip>
  );
}
