// src/components/ui/select.tsx
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
}

export function Select({ label, error, options, placeholder, className = '', ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      )}
      <div className="relative">
        <select
          className={`
            w-full px-4 py-2.5 pr-10
            bg-white border rounded-lg
            text-gray-900
            appearance-none cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${error ? 'border-red-300' : 'border-gray-300'}
            ${className}
          `}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▼</span>
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}