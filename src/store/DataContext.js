import React, { createContext, useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [data, setData] = useState({
    tasks: [],
    settings: { workTime: 25, breakTime: 5, longBreakTime: 15 },
    reports: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedData = await ipcRenderer.invoke('get-data');
        setData(loadedData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      ipcRenderer.invoke('save-data', data);
    }
  }, [data, loading]);

  // Tasks management
  const addTask = (task) => {
    const newTask = {
      id: uuidv4(),
      title: task.title,
      description: task.description || '',
      completed: false,
      created: new Date().toISOString(),
      dueDate: task.dueDate || null,
      reminder: task.reminder || null,
      subtasks: task.subtasks || [],
      repeat: task.repeat || null,
      notes: task.notes || '',
      pomodorosCompleted: 0
    };
    
    setData(prevData => ({
      ...prevData,
      tasks: [...prevData.tasks, newTask]
    }));
    
    return newTask.id;
  };

  const updateTask = (taskId, updates) => {
    setData(prevData => ({
      ...prevData,
      tasks: prevData.tasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    }));
  };

  const deleteTask = (taskId) => {
    setData(prevData => ({
      ...prevData,
      tasks: prevData.tasks.filter(task => task.id !== taskId)
    }));
  };

  // Pomodoro tracking
  const addPomodoro = (taskId) => {
    const now = new Date().toISOString();
    
    // Update task
    setData(prevData => {
      const updatedTasks = prevData.tasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            pomodorosCompleted: task.pomodorosCompleted + 1
          };
        }
        return task;
      });
      
      // Update reports
      const todayReport = prevData.reports.find(r => 
        new Date(r.date).toDateString() === new Date().toDateString()
      );
      
      let updatedReports;
      if (todayReport) {
        updatedReports = prevData.reports.map(report => {
          if (new Date(report.date).toDateString() === new Date().toDateString()) {
            return {
              ...report,
              pomodoros: [...report.pomodoros, { taskId, timestamp: now }]
            };
          }
          return report;
        });
      } else {
        updatedReports = [
          ...prevData.reports,
          {
            date: new Date().toISOString(),
            pomodoros: [{ taskId, timestamp: now }]
          }
        ];
      }
      
      return {
        ...prevData,
        tasks: updatedTasks,
        reports: updatedReports
      };
    });
  };

  // Settings management
  const updateSettings = (newSettings) => {
    setData(prevData => ({
      ...prevData,
      settings: { ...prevData.settings, ...newSettings }
    }));
  };

  const value = {
    tasks: data.tasks,
    settings: data.settings,
    reports: data.reports,
    loading,
    addTask,
    updateTask,
    deleteTask,
    addPomodoro,
    updateSettings
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};