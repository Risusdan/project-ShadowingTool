import { useState, useEffect, useRef, type ReactNode } from 'react';

interface FadeInProps {
  show: boolean;
  children: ReactNode;
}

export default function FadeIn({ show, children }: FadeInProps) {
  const [shouldRender, setShouldRender] = useState(show);
  const [visible, setVisible] = useState(show);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      // Trigger fade-in on next frame so the transition fires
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [show]);

  const handleTransitionEnd = () => {
    if (!show) {
      setShouldRender(false);
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      ref={ref}
      data-fadein=""
      onTransitionEnd={handleTransitionEnd}
      className={`transition-all duration-300 ${
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-2'
      }`}
    >
      {children}
    </div>
  );
}
