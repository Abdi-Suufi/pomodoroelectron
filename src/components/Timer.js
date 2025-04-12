import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../store/DataContext';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

function Timer() {
  const { tasks, settings, addPomodoro } = useData();
  const [activeTask, setActiveTask] = useState(null);
  const [timeLeft, setTimeLeft] = useState(settings.workTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // 'work', 'break', or 'longBreak'
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const intervalRef = useRef(null);

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
  }, [isActive]);

  const handleTimerComplete = () => {
    const notification = {
      work: "Time to take a break!",
      break: "Break's over! Back to work.",
      longBreak: "Long break over! Ready to start again?"
    };
    
    ipcRenderer.send('set-timer-notification', notification[mode]);
    
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
  };

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

  return (
    <div className="timer-container">
      <h2>{mode === 'work' ? 'Work Time' : mode === 'break' ? 'Short Break' : 'Long Break'}</h2>
      
      <div className="timer-display">
        {formatTime(timeLeft)}
      </div>
      
      <div className="timer-controls">
        <button onClick={toggleTimer}>
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button onClick={resetTimer}>Reset</button>
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
        Completed Pomodoros: {pomodoroCount}
      </div>
    </div>
  );
}

export default Timer;