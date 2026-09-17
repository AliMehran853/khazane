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
        relative flex h-[120px] w-[120px] items-center justify-center
        rounded-full border border-[#E3B341]/30 bg-[#0F211E]
        disabled:opacity-50
      "
      aria-label="ورود با اثر انگشت"
    >
      {/* حلقه‌های نبض */}
      <motion.div
        className="absolute inset-0 rounded-full border border-[#E3B341]/30"
        animate={{ scale: [1, 1.35], opacity: [0.55, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute inset-0 rounded-full border border-[#E3B341]/20"
        animate={{ scale: [1, 1.6], opacity: [0.35, 0] }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: 'easeOut',
          delay: 0.6,
        }}
      />

      <Fingerprint size={52} strokeWidth={1.5} className="text-[#E3B341]" />
    </motion.button>
  );
}