// path: frontend/src/components/common/ErrorMessage.tsx

import React from 'react';
import './ErrorMessage.css';

export interface ErrorMessageProps {
    error: string | Error | null;
    onRetry?: () => void;
    onClose?: () => void;
    variant?: 'error' | 'warning' | 'info';
    showIcon?: boolean;
    className?: string;
}

export default function ErrorMessage({
    error,
    onRetry,
    onClose,
    variant = 'error',
    showIcon = true,
    className = ''
}: ErrorMessageProps) {
    if (!error) return null;

    const errorMessage = error instanceof Error ? error.message : String(error);
    
    const getIcon = () => {
        if (!showIcon) return null;
        
        switch (variant) {
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            case 'info':
                return 'ℹ️';
            default:
                return '❌';
        }
    };

    const getVariantClass = () => {
        switch (variant) {
            case 'error':
                return 'error-message--error';
            case 'warning':
                return 'error-message--warning';
            case 'info':
                return 'error-message--info';
            default:
                return 'error-message--error';
        }
    };

    return (
        <div className={`error-message ${getVariantClass()} ${className}`}>
            <div className="error-message__content">
                {getIcon() && (
                    <span className="error-message__icon">
                        {getIcon()}
                    </span>
                )}
                <span className="error-message__text">
                    {errorMessage}
                </span>
            </div>
            
            <div className="error-message__actions">
                {onRetry && (
                    <button
                        type="button"
                        className="error-message__retry-btn"
                        onClick={onRetry}
                        title="다시 시도"
                    >
                        🔄 다시 시도
                    </button>
                )}
                
                {onClose && (
                    <button
                        type="button"
                        className="error-message__close-btn"
                        onClick={onClose}
                        title="닫기"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
}
