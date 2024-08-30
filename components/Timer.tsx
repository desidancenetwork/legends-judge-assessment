import React, { useEffect, useRef, useCallback, useState } from 'react';

interface TimerProps {
  timeRemaining: number;
  setTimeRemaining: React.Dispatch<React.SetStateAction<number>>;
  onTimeUp: () => void;
  totalTime: number;
}

const Timer: React.FC<TimerProps> = React.memo(({ timeRemaining, setTimeRemaining, onTimeUp, totalTime }) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  const updateTime = useCallback(() => {
    if (isVisible) {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          onTimeUp();
          return 0;
        }
        return prevTime - 1;
      });
    }
  }, [setTimeRemaining, onTimeUp, isVisible]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (timerRef.current) {
      observer.observe(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        observer.unobserve(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      intervalRef.current = setInterval(updateTime, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateTime, isVisible]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const percentage = (timeRemaining / totalTime) * 100;

  return (
    <div ref={timerRef} className="w-full max-w-md mx-auto">
      <div className="mb-2 text-2xl font-bold text-center text-white">
        {`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div 
          className="bg-blue-600 h-2.5 rounded-full" 
          style={{ width: `${percentage}%`, transition: 'width 1s linear' }}
        ></div>
      </div>
    </div>
  );
});

Timer.displayName = 'Timer';

export default Timer;