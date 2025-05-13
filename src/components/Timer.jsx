import React, { useState, useEffect } from 'react';

const Timer = ({ expiryTime, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(expiryTime) - new Date();
      
      if (difference <= 0) {
        setTimeLeft(null);
        onExpire && onExpire();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [expiryTime, onExpire]);

  if (!timeLeft) return null;

  return (
    <div className="inline-flex items-center space-x-2 text-sm font-medium bg-red-50 text-red-700 px-3 py-1 rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
      <span>
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {timeLeft.hours > 0 && `${timeLeft.hours}h `}
        {timeLeft.minutes > 0 && `${timeLeft.minutes}m `}
        {`${timeLeft.seconds}s`}
      </span>
    </div>
  );
};

export default Timer; 