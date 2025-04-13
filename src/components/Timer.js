import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useData } from '../store/DataContext';

function Timer() {
  const { tasks, settings, addPomodoro } = useData();
  const [activeTask, setActiveTask] = useState(null);
  const [timeLeft, setTimeLeft] = useState(settings.workTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // 'work', 'break', or 'longBreak'
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const intervalRef = useRef(null);

  const handleTimerComplete = useCallback(() => {
    const notification = {
      work: "Time to take a break!",
      break: "Break's over! Back to work.",
      longBreak: "Long break over! Ready to start again?"
    };
    
    window.electron.ipcRenderer.send('set-timer-notification', notification[mode]);
    
    if (mode === 'work') {
      if (activeTask) {
        addPomodoro(activeTask);
      }
      
      setPomodoroCount(prev => {
        const newCount = prev + 1;
        if (newCount % 4 === 0) {
          setMode('longBreak');
          setTimeLeft(settings.longBreakTime * 60);
        } else {
          setMode('break');
          setTimeLeft(settings.breakTime * 60);
        }
        return newCount;
      });
    } else {
      // After any break, back to work
      setMode('work');
      setTimeLeft(settings.workTime * 60);
    }
    
    setIsActive(false);
  }, [mode, activeTask, addPomodoro, settings.longBreakTime, settings.breakTime, settings.workTime]);

  // Reset timer when settings change
  useEffect(() => {
    if (mode === 'work') {
      setTimeLeft(settings.workTime * 60);
    } else if (mode === 'break') {
      setTimeLeft(settings.breakTime * 60);
    } else {
      setTimeLeft(settings.longBreakTime * 60);
    }
  }, [settings, mode]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current);
            handleTimerComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, handleTimerComplete]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'work') {
      setTimeLeft(settings.workTime * 60);
    } else if (mode === 'break') {
      setTimeLeft(settings.breakTime * 60);
    } else {
      setTimeLeft(settings.longBreakTime * 60);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage for the circular timer
  const getProgressPercentage = () => {
    const totalTime = mode === 'work' 
      ? settings.workTime * 60 
      : mode === 'break' 
        ? settings.breakTime * 60 
        : settings.longBreakTime * 60;
    
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  // Get mode-specific colors
  const getModeColors = () => {
    switch(mode) {
      case 'work':
        return { bg: 'var(--primary-light)', color: 'var(--primary-color)' };
      case 'break':
        return { bg: '#dbeafe', color: '#3b82f6' };
      case 'longBreak':
        return { bg: '#dcfce7', color: '#10b981' };
      default:
        return { bg: 'var(--primary-light)', color: 'var(--primary-color)' };
    }
  };

  const modeColors = getModeColors();

  return (
    <div className="timer-container" style={{ backgroundColor: modeColors.bg }}>
      <h2>{mode === 'work' ? 'Work Time' : mode === 'break' ? 'Short Break' : 'Long Break'}</h2>
      
      <div className="timer-circle-container">
        <div className="timer-circle" style={{ 
          background: `conic-gradient(${modeColors.color} ${getProgressPercentage()}%, transparent ${getProgressPercentage()}%)`
        }}>
          <div className="timer-circle-inner">
            <div className="timer-display" style={{ color: modeColors.color }}>
              {formatTime(timeLeft)}
            </div>
            <div className="timer-mode-indicator" style={{ color: modeColors.color }}>
              {mode === 'work' ? 'Focus' : mode === 'break' ? 'Short Break' : 'Long Break'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="timer-controls">
        <button 
          onClick={toggleTimer}
          style={{ 
            backgroundColor: modeColors.color,
            boxShadow: `0 4px 6px -1px ${modeColors.color}40`
          }}
        >
          {isActive ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
              Pause
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              Start
            </>
          )}
        </button>
        <button 
          onClick={resetTimer}
          style={{ 
            backgroundColor: 'var(--surface-color)',
            color: modeColors.color,
            border: `1px solid ${modeColors.color}`
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
          Reset
        </button>
      </div>
      
      <div className="task-selector">
        <label htmlFor="activeTask">Active Task:</label>
        <select 
          id="activeTask" 
          value={activeTask || ''} 
          onChange={(e) => setActiveTask(e.target.value)}
        >
          <option value="">-- Select a task --</option>
          {tasks
            .filter(task => !task.completed)
            .map(task => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
        </select>
      </div>
      
      <div className="pomodoro-counter">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        Completed Pomodoros: {pomodoroCount}
      </div>
    </div>
  );
}

export default Timer;