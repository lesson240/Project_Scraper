// path: frontend/src/components/common/LoadingSpinner.tsx

import React from 'react';
import './LoadingSpinner.css';

export interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    color?: string;
    text?: string;
    className?: string;
}

export default function LoadingSpinner({
    size = 'medium',
    color = 'currentColor',
    text,
    className = ''
}: LoadingSpinnerProps) {
    const sizeClass = `loading-spinner--${size}`;
    
    return (
        <div className={`loading-spinner ${sizeClass} ${className}`}>
            <div 
                className="loading-spinner__spinner"
                style={{ borderTopColor: color }}
            />
            {text && (
                <div className="loading-spinner__text">
                    {text}
                </div>
            )}
        </div>
    );
}
