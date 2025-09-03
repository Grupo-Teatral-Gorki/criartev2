import React from 'react';

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Reusable error state component
 * Provides consistent error UI with optional retry functionality
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  className = ""
}) => {
  return (
    <div className={`p-6 bg-white dark:bg-slate-900 rounded-lg shadow-lg ${className}`}>
      <div className="flex items-center space-x-3 text-error-600">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{error}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
};
