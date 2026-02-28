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
    expect(screen.getByText(/delayed shadowing/i)).toBeInTheDocument();
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
      /contextual immersion/i,
      /meaning confirmation/i,
      /sound-to-text linking/i,
      /delayed shadowing/i,
      /pure listening & speaking/i,
    ];
    steps.forEach((step, i) => {
      const { unmount } = render(<StepGuide currentStep={step} onStepChange={vi.fn()} />);
      expect(screen.getByText(labels[i])).toBeInTheDocument();
      unmount();
    });
  });
});
