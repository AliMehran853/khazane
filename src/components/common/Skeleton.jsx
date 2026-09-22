export function SkeletonLine({ width = '100%', height = 12, className = '' }) {
  return (
    <div
      className={['kh-skeleton rounded-md', className].join(' ')}
      style={{ width, height }}
    />
  );
}

export function SkeletonChart({ height = 230 }) {
  const bars = [38, 62, 45, 78, 55, 70, 48];

  return (
    <div
      className="flex items-end justify-between gap-2 px-4 pb-2 pt-3"
      style={{ height }}
    >
      {bars.map((h, i) => (
        <div
          key={i}
          className="kh-skeleton flex-1 rounded-t-md"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonDonut({ height = 260 }) {
  const ring = Math.min(height - 80, 160);

  return (
    <div className="flex items-center justify-center" style={{ height }}>
      <div
        className="kh-skeleton rounded-full"
        style={{ width: ring, height: ring }}
      />
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="glass rounded-3xl p-4 lg:p-5">
      <div className="kh-skeleton h-3 w-16 rounded" />
      <div className="kh-skeleton mt-3 h-6 w-24 rounded" />
    </div>
  );
}

export function SkeletonListRow() {
  return (
    <div className="flex items-center gap-3 border-b border-border-1 px-4 py-3 last:border-b-0">
      <div className="kh-skeleton h-10 w-10 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <div className="kh-skeleton h-3 w-24 rounded" />
        <div className="kh-skeleton mt-2 h-2.5 w-16 rounded" />
      </div>
      <div className="kh-skeleton h-3 w-14 rounded" />
    </div>
  );
}

export function SkeletonList({ rows = 5 }) {
  return (
    <div className="glass overflow-hidden rounded-3xl">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonListRow key={i} />
      ))}
    </div>
  );
}