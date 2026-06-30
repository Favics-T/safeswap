import React, { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register?: any;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, register, name, id, required, ...props }, ref) => {
    const textareaId = id || name || label?.toLowerCase().replace(/\s+/g, '-');
    const hasError = !!error;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          name={name}
          ref={ref}
          className={cn(
            'block w-full rounded-lg border px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition-colors min-h-[100px]',
            hasError
              ? 'border-red-300 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500',
            className
          )}
          {...(register ? register(name) : {})}
          {...props}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
