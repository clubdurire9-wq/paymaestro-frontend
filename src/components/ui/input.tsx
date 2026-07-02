// src/components/ui/input.tsx
import React, { forwardRef } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, success, hint, icon, rightIcon, onRightIconClick, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-slate-500">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            className={`
              w-full px-4 py-2.5
              bg-white dark:bg-slate-800 border rounded-lg
              text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:bg-gray-50 dark:disabled:bg-slate-800/50 disabled:text-gray-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed
              ${icon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${error
                ? 'border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-800'
                : success
                ? 'border-green-300 dark:border-green-600 focus:border-green-500 focus:ring-green-200 dark:focus:ring-green-800'
                : 'border-gray-300 dark:border-slate-600 focus:border-violet-500 focus:ring-violet-200 dark:focus:ring-violet-800'
              }
              ${className}
            `}
            {...props}
          />

          {rightIcon && (
            <button
              type="button"
              onClick={onRightIconClick}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
            >
              {rightIcon}
            </button>
          )}

          {error && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-red-500 dark:text-red-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}
          {success && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-500 dark:text-green-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}
        </div>

        {error && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>}
        {success && <p className="mt-1.5 text-sm text-green-600 dark:text-green-400">{success}</p>}
        {hint && !error && !success && <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
