import React from 'react';
import { STEP_METADATA } from '../constants';
import { Check } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, onStepClick }) => {
  const currentMeta = STEP_METADATA[currentStep - 1] || STEP_METADATA[0];
  const progressPercent = Math.round((currentStep / STEP_METADATA.length) * 100);

  return (
    <div className="w-full mb-6">
      {/* Step Heading & Completion Status */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Steg {currentStep} av {STEP_METADATA.length}: {currentMeta.title}
        </span>
        <span className="text-xs font-extrabold text-[#436ebe] dark:text-blue-400">
          {progressPercent}% Klart
        </span>
      </div>

      {/* Main Progress Bar */}
      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4 border border-slate-200/60 dark:border-slate-700/60">
        <div
          className="h-full bg-[#436ebe] rounded-full transition-all duration-400 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step Pills Row */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {STEP_METADATA.map((step) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => {
                if (step.id < currentStep) {
                  onStepClick(step.id);
                }
              }}
              disabled={step.id >= currentStep}
              className={`py-2 px-1 rounded-xl text-center transition-all text-xs font-bold border flex flex-col items-center justify-center ${
                isCurrent
                  ? 'bg-[#436ebe] text-white border-[#436ebe] shadow-xs'
                  : isCompleted
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-[#436ebe] dark:text-blue-300 border-blue-200 dark:border-blue-900 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40'
                  : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700/60 cursor-not-allowed opacity-75'
              }`}
            >
              <div className="flex items-center justify-center">
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>
              <span className="hidden sm:inline text-[10px] truncate max-w-full font-medium mt-0.5">
                {step.title.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

