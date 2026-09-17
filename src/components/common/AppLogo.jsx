export default function AppLogo({ size = 80, withShadow = true }) {
  return (
    <div
      className="relative"
      style={{
        width: size,
        height: size,
        filter: withShadow
          ? 'drop-shadow(0 8px 24px rgba(227,179,65,0.28))'
          : undefined,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E3B341" />
            <stop offset="100%" stopColor="#B9862A" />
          </linearGradient>
        </defs>

        <rect
          x="8"
          y="8"
          width="84"
          height="84"
          rx="24"
          fill="url(#logoGold)"
        />

        <text
          x="50"
          y="70"
          textAnchor="middle"
          fontFamily="Vazirmatn, sans-serif"
          fontSize="56"
          fontWeight="800"
          fill="#0A1614"
        >
          $
        </text>
      </svg>
    </div>
  );
}