import { useId } from 'react';

export default function AppLogo({
  size = 80,
  withShadow = true,
  className = '',
}) {
  const rawId = useId();
  const gradId = `kh-logo-grad-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return (
    <div
      className={['relative shrink-0', className].join(' ')}
      style={{
        width: size,
        height: size,
        filter: withShadow ? 'var(--kh-logo-shadow)' : undefined,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--kh-primary)" />
            <stop offset="100%" stopColor="var(--kh-primary-dark)" />
          </linearGradient>
        </defs>

        <rect
          x="8"
          y="8"
          width="84"
          height="84"
          rx="24"
          fill={`url(#${gradId})`}
        />

        <text
          x="50"
          y="70"
          textAnchor="middle"
          fontFamily="Vazirmatn, sans-serif"
          fontSize="56"
          fontWeight="800"
          fill="var(--kh-on-primary)"
        >
          $
        </text>
      </svg>
    </div>
  );
}