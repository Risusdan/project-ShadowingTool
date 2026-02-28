import type { ShadowingStep } from '../types';
import { STEP_LABELS, STEP_DESCRIPTIONS, STEP_FEATURES } from '../types';

interface StepGuideProps {
  currentStep: ShadowingStep;
  onStepChange: (step: ShadowingStep) => void;
  recommendedStep?: ShadowingStep;
}

const STEPS: ShadowingStep[] = [1, 2, 3, 4, 5];

export default function StepGuide({ currentStep, onStepChange, recommendedStep }: StepGuideProps) {
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {STEPS.map((step) => (
          <div key={step} className="relative group flex-1 sm:flex-none" data-step={step}>
            {recommendedStep === step && (
              <div className="absolute inset-0 rounded-lg ring-2 ring-blue-300 animate-pulse pointer-events-none" />
            )}
            <button
              onClick={() => onStepChange(step)}
              aria-label={`Step ${step}: ${STEP_LABELS[step]}`}
              aria-current={step === currentStep ? 'step' : undefined}
              className={`w-full sm:w-10 h-10 rounded-lg font-semibold text-sm transition-colors ${
                step === currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {step}
            </button>
            {/* CSS-only tooltip on hover */}
            <div className="invisible group-hover:visible absolute top-full left-0 mt-1 z-10 w-48 bg-gray-800 text-white text-xs rounded-lg p-2 shadow-lg">
              <p className="font-medium mb-1">{STEP_LABELS[step]}</p>
              <p className="text-gray-300 mb-1.5">{STEP_DESCRIPTIONS[step]}</p>
              <div className="flex flex-wrap gap-1">
                {STEP_FEATURES[step].map((feature) => (
                  <span
                    key={feature}
                    className="px-1.5 py-0.5 bg-gray-700 rounded text-[10px] text-gray-200"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-600 font-medium">
        Step {currentStep}: {STEP_LABELS[currentStep]}
      </p>
    </div>
  );
}
