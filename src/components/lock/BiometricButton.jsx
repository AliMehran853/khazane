import { motion } from 'framer-motion';
import { Fingerprint } from 'lucide-react';

export default function BiometricButton({ onPress, disabled = false }) {
  return (
    <motion.button
      type="button"
      onClick={onPress}
      disabled={disabled}
      whileTap={{ scale: 0.94 }}
      className="
        glass-strong relative flex h-[120px] w-[120px] items-center justify-center
        rounded-full border-[#00D1A7]/40
        disabled:opacity-50
      "
      aria-label="ورود با اثر انگشت"
    >
      <motion.div
        className="absolute inset-0 rounded-full border border-[#00D1A7]/40"
        animate={{ scale: [1, 1.35], opacity: [0.55, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute inset-0 rounded-full border border-[#00D1A7]/25"
        animate={{ scale: [1, 1.6], opacity: [0.35, 0] }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: 'easeOut',
          delay: 0.6,
        }}
      />

      <Fingerprint size={52} strokeWidth={1.5} className="text-[#00D1A7]" />
    </motion.button>
  );
}