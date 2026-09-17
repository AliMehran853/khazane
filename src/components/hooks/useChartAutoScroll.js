import { useEffect, useRef } from 'react';

function normalizeLabel(str) {
  return String(str)
    .trim()
    .replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u202A-\u202E]/g, '')
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

export function useChartAutoScroll(data, period, shouldScroll) {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container || !shouldScroll) return;

    let currentIndex = data.findIndex((d) => d.isCurrent);
    if (currentIndex < 0) currentIndex = 0;

    let attempts = 0;
    let timeoutId;

    const tryScroll = () => {
      attempts += 1;

      const allLabels = Array.from(
        container.querySelectorAll('.apexcharts-xaxis-label')
      );

      const rendered = [];
      for (const el of allLabels) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue;

        const text = normalizeLabel(el.textContent);
        const idx = data.findIndex(
          (d) => normalizeLabel(d.label) === text
        );
        if (idx < 0) continue;

        rendered.push({
          idx,
          center: (rect.left + rect.right) / 2,
        });
      }

      if (rendered.length > 0) {
        let closest = rendered[0];
        let minDist = Math.abs(closest.idx - currentIndex);

        for (let i = 1; i < rendered.length; i++) {
          const d = Math.abs(rendered[i].idx - currentIndex);
          if (d < minDist) {
            minDist = d;
            closest = rendered[i];
          }
        }

        let perIndexWidth = 36;
        let direction = -1;

        if (rendered.length >= 2) {
          const sorted = [...rendered].sort((a, b) => a.idx - b.idx);
          for (let i = 1; i < sorted.length; i++) {
            const dIdx = sorted[i].idx - sorted[i - 1].idx;
            if (dIdx > 0) {
              const screenDiff = sorted[i].center - sorted[i - 1].center;
              perIndexWidth = Math.abs(screenDiff) / dIdx;
              direction = Math.sign(screenDiff) || -1;
              break;
            }
          }
        }

        const idxDiff = currentIndex - closest.idx;
        const targetScreenX =
          closest.center + idxDiff * perIndexWidth * direction;

        const containerRect = container.getBoundingClientRect();
        const containerCenter =
          (containerRect.left + containerRect.right) / 2;

        const D = targetScreenX - containerCenter;

        if (Math.abs(D) >= 4) {
          container.scrollLeft += D;
        }

        if (minDist > 0 && attempts < 6) {
          timeoutId = setTimeout(tryScroll, 200);
        }
        return;
      }

      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      const maxScroll = Math.max(0, scrollWidth - clientWidth);

      if (maxScroll <= 0) {
        if (attempts < 25) {
          timeoutId = setTimeout(tryScroll, 150);
        }
        return;
      }

      const progress = currentIndex / Math.max(1, data.length - 1);
      const targetScroll = progress * maxScroll;

      container.scrollLeft = -targetScroll;
      if (Math.abs(container.scrollLeft) < targetScroll - 5) {
        container.scrollLeft = targetScroll;
      }
    };

    timeoutId = setTimeout(tryScroll, 300);

    return () => clearTimeout(timeoutId);
  }, [data, period, shouldScroll]);

  return ref;
}