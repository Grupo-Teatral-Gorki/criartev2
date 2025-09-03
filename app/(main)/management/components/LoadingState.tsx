import React from 'react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

/**
 * Reusable loading state component
 * Provides consistent loading UI across the application
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Carregando...",
  className = ""
}) => {
  return (
    <div className={`p-6 bg-white dark:bg-slate-900 rounded-lg shadow-lg ${className}`}>
      <div className="flex items-center justify-center space-x-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        <span className="text-slate-600 dark:text-slate-300">{message}</span>
      </div>
    </div>
  );
};
