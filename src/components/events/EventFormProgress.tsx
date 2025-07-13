
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  completed: boolean;
  hasErrors: boolean;
}

interface EventFormProgressProps {
  steps: Step[];
  currentStep: string;
}

export const EventFormProgress: React.FC<EventFormProgressProps> = ({ steps, currentStep }) => {
  const currentIndex = steps.findIndex(step => step.id === currentStep);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isPassed = index < currentIndex;
          
          return (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  isActive && "bg-primary text-primary-foreground",
                  isPassed && "bg-green-500 text-white",
                  !isActive && !isPassed && "bg-muted text-muted-foreground",
                  step.hasErrors && !isPassed && "bg-red-500 text-white"
                )}
              >
                {isPassed ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  "ml-2 text-sm font-medium",
                  isActive && "text-primary",
                  isPassed && "text-green-600",
                  !isActive && !isPassed && "text-muted-foreground"
                )}
              >
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className="w-8 h-px bg-border mx-4" />
              )}
            </div>
          );
        })}
      </div>
      
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
