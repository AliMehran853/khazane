import { useCallback, useMemo } from 'react';
import { vibrate, HAPTIC } from '../utils/haptics';

export function useHaptic() {
  const tap = useCallback(() => vibrate(HAPTIC.tap), []);
  const light = useCallback(() => vibrate(HAPTIC.light), []);
  const medium = useCallback(() => vibrate(HAPTIC.medium), []);
  const heavy = useCallback(() => vibrate(HAPTIC.heavy), []);
  const success = useCallback(() => vibrate(HAPTIC.success), []);
  const warning = useCallback(() => vibrate(HAPTIC.warning), []);
  const error = useCallback(() => vibrate(HAPTIC.error), []);

  return useMemo(
    () => ({ tap, light, medium, heavy, success, warning, error }),
    [tap, light, medium, heavy, success, warning, error],
  );
}