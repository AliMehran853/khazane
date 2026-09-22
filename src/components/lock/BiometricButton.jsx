import { motion } from 'framer-motion';
import { Fingerprint } from 'lucide-react';

export default function BiometricButton({ onPress, disabled = false }) {
  return (
    <motion.button
      type="button"
      onClick={onPress}
      disabled={disabled}
      whileTap={{ scale: 0.94 }}
      className="kh-bio-btn glass-strong"
      aria-label="ورود با اثر انگشت"
    >
      <motion.div
        className="kh-bio-ring"
        animate={{ scale: [1, 1.35], opacity: [0.55, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
      />
      <motion.div
        className="kh-bio-ring kh-bio-ring-2"
        animate={{ scale: [1, 1.6], opacity: [0.35, 0] }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: 'easeOut',
          delay: 0.6,
        }}
      />

      <Fingerprint size={52} strokeWidth={1.5} className="text-primary" />
    </motion.button>
  );
}