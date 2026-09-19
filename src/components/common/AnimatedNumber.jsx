import { useEffect, useRef, useState } from 'react';

const FA_NUM = new Intl.NumberFormat('fa-AF');

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export default function AnimatedNumber({
  value,
  duration = 700,
  formatter,
  className,
  style,
}) {
  const target = Number(value) || 0;
  const [display, setDisplay] = useState(target);
  const displayRef = useRef(target);
  const rafRef = useRef(0);

  useEffect(() => {
    const from = displayRef.current;
    const to = target;

    if (from === to) return;

    cancelAnimationFrame(rafRef.current);
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(t);
      const current = from + (to - from) * eased;

      displayRef.current = current;
      setDisplay(current);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        displayRef.current = to;
        setDisplay(to);
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  const out = formatter
    ? formatter(display)
    : FA_NUM.format(Math.round(display));

  return (
    <span className={className} style={style}>
      {out}
    </span>
  );
}