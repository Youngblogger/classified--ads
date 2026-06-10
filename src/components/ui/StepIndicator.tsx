'use client';

import { Check } from 'lucide-react';

interface Step {
  id: number;
  label: string;
  shortLabel: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {steps.map((step, i) => {
        const isCompleted = currentStep > step.id;
        const isActive = currentStep === step.id;
        const isLast = i === steps.length - 1;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                  isCompleted
                    ? 'bg-green-500 text-white shadow-lg shadow-green-200 scale-100'
                    : isActive
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 scale-110 ring-4 ring-primary-100'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{step.id}</span>
                )}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary-600 animate-ping" />
                )}
              </div>
              <span
                className={`mt-1.5 text-[10px] sm:text-xs font-semibold whitespace-nowrap transition-colors duration-300 ${
                  isActive
                    ? 'text-primary-700 dark:text-primary-400'
                    : isCompleted
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{step.shortLabel}</span>
              </span>
            </div>
            {!isLast && (
              <div className="relative mx-1.5 sm:mx-3 mb-5">
                <div
                  className={`w-8 sm:w-16 md:w-24 h-0.5 rounded-full transition-all duration-500 ${
                    isCompleted ? 'bg-green-400' : isActive ? 'bg-primary-300' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
