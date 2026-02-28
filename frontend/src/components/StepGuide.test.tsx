import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StepGuide from './StepGuide';
import type { ShadowingStep } from '../types';

describe('StepGuide', () => {
  it('renders 5 step buttons', () => {
    render(<StepGuide currentStep={1} onStepChange={vi.fn()} />);
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByRole('button', { name: new RegExp(`${i}`) })).toBeInTheDocument();
    }
  });

  it('highlights the current step', () => {
    render(<StepGuide currentStep={3} onStepChange={vi.fn()} />);
    const btn = screen.getByRole('button', { name: /3/ });
    expect(btn.className).toMatch(/bg-blue-600/);
  });

  it('does not highlight non-current steps', () => {
    render(<StepGuide currentStep={3} onStepChange={vi.fn()} />);
    const btn = screen.getByRole('button', { name: /step 1/i });
    expect(btn.className).not.toMatch(/bg-blue-600/);
  });

  it('displays the current step label', () => {
    render(<StepGuide currentStep={4} onStepChange={vi.fn()} />);
    expect(screen.getByText(/step 4: delayed shadowing/i)).toBeInTheDocument();
  });

  it('calls onStepChange when a step button is clicked', async () => {
    const user = userEvent.setup();
    const onStepChange = vi.fn();
    render(<StepGuide currentStep={1} onStepChange={onStepChange} />);

    await user.click(screen.getByRole('button', { name: /step 4/i }));
    expect(onStepChange).toHaveBeenCalledWith(4);
  });

  it('displays label for each step when switched', () => {
    const steps: ShadowingStep[] = [1, 2, 3, 4, 5];
    const labels = [
      /step 1: contextual immersion/i,
      /step 2: meaning confirmation/i,
      /step 3: sound-to-text linking/i,
      /step 4: delayed shadowing/i,
      /step 5: pure listening & speaking/i,
    ];
    steps.forEach((step, i) => {
      const { unmount } = render(<StepGuide currentStep={step} onStepChange={vi.fn()} />);
      expect(screen.getByText(labels[i])).toBeInTheDocument();
      unmount();
    });
  });

  // --- Phase 1: Tooltips & Feature Tags ---

  it('renders tooltip with description for each step', () => {
    render(<StepGuide currentStep={1} onStepChange={vi.fn()} />);

    // Step 1 tooltip description is in the DOM (CSS-hidden until hover)
    expect(screen.getByText(/absorb rhythm and context/i)).toBeInTheDocument();
    // Step 4 tooltip description
    expect(screen.getByText(/pause after each segment and repeat/i)).toBeInTheDocument();
  });

  it('renders feature tags in each step tooltip', () => {
    render(<StepGuide currentStep={1} onStepChange={vi.fn()} />);

    // Step 4 tooltip should contain Recording feature tag
    const step4Wrapper = screen.getByRole('button', { name: /step 4/i }).closest('[data-step]')!;
    const step4Tooltip = step4Wrapper.querySelector('.flex.flex-wrap')!;
    expect(step4Tooltip.textContent).toContain('Recording');

    // Step 1 has only Video
    const step1Wrapper = screen.getByRole('button', { name: /step 1/i }).closest('[data-step]')!;
    const step1Tooltip = step1Wrapper.querySelector('.flex.flex-wrap')!;
    expect(step1Tooltip.textContent).toBe('Video');
  });

  it('renders pulsing ring on recommendedStep', () => {
    render(<StepGuide currentStep={1} onStepChange={vi.fn()} recommendedStep={2} />);

    const wrapper = screen.getByRole('button', { name: /step 2/i }).closest('[data-step]')!;
    expect(wrapper.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('does not render pulsing ring when no recommendedStep', () => {
    render(<StepGuide currentStep={1} onStepChange={vi.fn()} />);

    const wrapper = screen.getByRole('button', { name: /step 1/i }).closest('[data-step]')!;
    expect(wrapper.querySelector('.animate-pulse')).not.toBeInTheDocument();
  });
});
