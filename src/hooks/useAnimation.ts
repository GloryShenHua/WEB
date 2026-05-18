import { useEffect, useRef } from 'react';
import { useAlgorithmStore } from '../store';

export function useAnimation() {
  const { isPlaying, speed, currentStep, steps, stepForward, setIsPlaying } = useAlgorithmStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isPlaying && steps.length > 0) {
      const delay = Math.max(100, 1000 / speed);
      intervalRef.current = setInterval(() => {
        const { currentStep: cs, steps: ss } = useAlgorithmStore.getState();
        if (cs >= ss.length - 1) {
          setIsPlaying(false);
        } else {
          stepForward();
        }
      }, delay);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, speed, steps.length]);

  return { isPlaying, currentStep, totalSteps: steps.length };
}
