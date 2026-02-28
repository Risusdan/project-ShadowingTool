interface SpinnerProps {
  label?: string;
  size?: 'sm' | 'md';
}

const SIZE_CLASSES = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
};

export default function Spinner({ label = 'Loading...', size = 'md' }: SpinnerProps) {
  return (
    <span role="status" aria-label={label || undefined} className="inline-flex items-center gap-2">
      <svg
        className={`${SIZE_CLASSES[size]} animate-spin text-blue-600`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      {label && <span className="text-sm text-gray-600">{label}</span>}
    </span>
  );
}
