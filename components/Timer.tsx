import React, { useEffect } from 'react';

interface TimerProps {
  timeRemaining: number;
  setTimeRemaining: React.Dispatch<React.SetStateAction<number>>;
  onTimeUp: () => void;
  totalTime: number;
}

const Timer: React.FC<TimerProps> = ({ timeRemaining, setTimeRemaining, onTimeUp, totalTime }) => {
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [setTimeRemaining, onTimeUp]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const percentage = (timeRemaining / totalTime) * 100;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-2 text-2xl font-bold text-center text-white">
        {`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-linear" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default Timer;