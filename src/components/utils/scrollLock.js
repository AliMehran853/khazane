// ============================================================
// Body scroll lock — replaces 4 duplicated lockBody() copies
// Handles nested locks (modal → confirm) with reference counting
// ============================================================

let lockCount = 0;
let savedOverflow = '';
let savedPaddingRight = '';

export function lockBody() {
  if (typeof document === 'undefined') return () => {};

  lockCount += 1;

  if (lockCount === 1) {
    const body = document.body;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    savedOverflow = body.style.overflow;
    savedPaddingRight = body.style.paddingRight;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    lockCount = Math.max(0, lockCount - 1);

    if (lockCount === 0) {
      const body = document.body;
      body.style.overflow = savedOverflow;
      body.style.paddingRight = savedPaddingRight;
    }
  };
}