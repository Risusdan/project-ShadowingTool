import { render, screen } from '@testing-library/react';
import FadeIn from './FadeIn';

describe('FadeIn', () => {
  it('renders children when show is true', () => {
    render(
      <FadeIn show={true}>
        <p>Hello</p>
      </FadeIn>,
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('does not render children when show is false and not previously shown', () => {
    render(
      <FadeIn show={false}>
        <p>Hello</p>
      </FadeIn>,
    );
    expect(screen.queryByText('Hello')).not.toBeInTheDocument();
  });

  it('applies opacity-100 when show is true', () => {
    render(
      <FadeIn show={true}>
        <p>Hello</p>
      </FadeIn>,
    );
    const wrapper = screen.getByText('Hello').closest('[data-fadein]')!;
    expect(wrapper.className).toContain('opacity-100');
  });

  it('applies opacity-0 when show transitions to false', () => {
    const { rerender } = render(
      <FadeIn show={true}>
        <p>Hello</p>
      </FadeIn>,
    );
    rerender(
      <FadeIn show={false}>
        <p>Hello</p>
      </FadeIn>,
    );
    // Element is still in DOM during fade-out
    const wrapper = screen.getByText('Hello').closest('[data-fadein]')!;
    expect(wrapper.className).toContain('opacity-0');
  });
});
