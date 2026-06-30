import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface Step {
  label: string;
  status: 'complete' | 'current' | 'upcoming';
  timestamp?: string;
}

export interface StepperProps {
  steps: Step[];
  className?: string;
}

export const Stepper = ({ steps, className }: StepperProps) => {
  return (
    <div className={cn("flex flex-col", className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        
        return (
          <div key={index} className="relative flex gap-4 text-left">
            {/* Timeline line */}
            {!isLast && (
              <div 
                className={cn(
                  "absolute left-3.5 top-8 bottom-[-8px] w-0.5",
                  step.status === 'complete' ? "bg-blue-600" : "bg-gray-200"
                )}
              />
            )}
            
            {/* Step indicator */}
            <div className="relative flex flex-col items-center z-10 py-2">
              <div 
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors",
                  step.status === 'complete' 
                    ? "bg-blue-600 border-blue-600 text-white" 
                    : step.status === 'current'
                    ? "bg-white border-blue-600 text-blue-600"
                    : "bg-white border-gray-300 text-gray-300"
                )}
              >
                {step.status === 'complete' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-current" style={{ opacity: step.status === 'current' ? 1 : 0 }} />
                )}
              </div>
            </div>

            {/* Step content */}
            <div className="flex flex-col py-2 pb-6">
              <span className={cn(
                "text-sm font-medium",
                step.status === 'upcoming' ? "text-gray-500" : "text-gray-900"
              )}>
                {step.label}
              </span>
              {step.timestamp && (
                <span className="text-xs text-gray-500 mt-1">
                  {step.timestamp}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
