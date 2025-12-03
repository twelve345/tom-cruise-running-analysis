import { useTransition } from '@react-spring/web';

export function useAnimatedData<T>(data: T[], getKey: (item: T) => string, delay: number = 0) {
  return useTransition(data, {
    keys: getKey,
    from: { opacity: 0, transform: 'scale(0.9)' },
    enter: { opacity: 1, transform: 'scale(1)', delay },
    leave: { opacity: 0, transform: 'scale(0.9)' },
    config: { tension: 120, friction: 14 },
  });
}
