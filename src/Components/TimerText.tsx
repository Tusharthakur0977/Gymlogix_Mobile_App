import {StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';
import {CustomText} from './CustomText';

// Props for the Timer component
interface SimpleTimerProps {
  initialMinutes: number; // Countdown start value (in minutes)
}

const TimerText: React.FC<SimpleTimerProps> = ({initialMinutes}) => {
  // Convert minutes to seconds
  const [timeInSeconds, setTimeInSeconds] = useState(initialMinutes * 60);

  // Reset if prop changes
  useEffect(() => {
    setTimeInSeconds(initialMinutes * 60);
  }, [initialMinutes]);

  // Countdown effect
  useEffect(() => {
    if (timeInSeconds <= 0) return;

    const interval = setInterval(() => {
      setTimeInSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeInSeconds]);

  // Format into HH:MM:SS (or MM:SS if <1h)
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '00:00';

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins
        .toString()
        .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  return <CustomText>{formatTime(timeInSeconds)}</CustomText>;
};

export default TimerText;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C2526',
    padding: 20,
  },
});
