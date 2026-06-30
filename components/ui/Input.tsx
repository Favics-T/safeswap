import React, { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register?: any; 
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, prefix, register, name, id, required, ...props }, ref) => {
    const inputId = id || name || label?.toLowerCase().replace(/\s+/g, '-');
    const hasError = !!error;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          {prefix && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">{prefix}</span>
            </div>
          )}
          <input
            id={inputId}
            name={name}
            ref={ref}
            className={cn(
              'block w-full rounded-lg border px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition-colors',
              prefix ? 'pl-7' : '',
              hasError
                ? 'border-red-300 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500',
              className
            )}
            {...(register ? register(name) : {})}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
