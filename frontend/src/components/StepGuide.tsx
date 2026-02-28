import type { ShadowingStep } from '../types';
import { STEP_LABELS } from '../types';

interface StepGuideProps {
  currentStep: ShadowingStep;
  onStepChange: (step: ShadowingStep) => void;
}

const STEPS: ShadowingStep[] = [1, 2, 3, 4, 5];

export default function StepGuide({ currentStep, onStepChange }: StepGuideProps) {
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {STEPS.map((step) => (
          <button
            key={step}
            onClick={() => onStepChange(step)}
            aria-label={`Step ${step}: ${STEP_LABELS[step]}`}
            aria-current={step === currentStep ? 'step' : undefined}
            className={`flex-1 sm:flex-none sm:w-10 h-10 rounded-lg font-semibold text-sm transition-colors ${
              step === currentStep
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {step}
          </button>
        ))}
      </div>
      <p className="text-sm text-gray-600 font-medium">
        Step {currentStep}: {STEP_LABELS[currentStep]}
      </p>
    </div>
  );
}
