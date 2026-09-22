import Toast from './Toast';

export default function GreetingToast({
  open,
  greeting,
  onClose,
  duration = 7000,
}) {
  if (!greeting) return null;

  return (
    <Toast
      open={open}
      onClose={onClose}
      emoji={greeting.emoji}
      title={`${greeting.greeting} ${greeting.name}!`}
      duration={duration}
    >
      {greeting.message}
    </Toast>
  );
}