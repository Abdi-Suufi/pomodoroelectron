import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useData } from '../store/DataContext';

function TaskList() {
  const { tasks, addTask, updateTask, deleteTask } = useData();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      const taskId = addTask({ title: newTaskTitle.trim() });
      setNewTaskTitle('');
      navigate(`/task/${taskId}`);
    }
  };

  const toggleTaskCompletion = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    updateTask(taskId, { completed: !task.completed });
  };

  const filteredTasks = tasks.filter(task => showCompleted || !task.completed);

  return (
    <div className="task-list-container">
      <h2>Tasks</h2>
      
      <div className="filter-options">
        <label className="checkbox-container">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={() => setShowCompleted(!showCompleted)}
          />
          <span className="checkmark"></span>
          Show Completed Tasks
        </label>
      </div>
      
      <form onSubmit={handleSubmit} className="new-task-form">
        <div className="input-with-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a new task..."
          />
        </div>
        <button type="submit">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Task
        </button>
      </form>
      
      <ul className="task-list">
        {filteredTasks.map(task => (
          <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
            <div className="task-info">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTaskCompletion(task.id)}
                />
                <span className="checkmark"></span>
              </label>
              <div className="task-details">
                <h3 onClick={() => navigate(`/task/${task.id}`)}>{task.title}</h3>
                {task.dueDate && (
                  <span className="due-date">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  </span>
                )}
                {task.subtasks.length > 0 && (
                  <div className="subtask-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${(task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span>
                      {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtasks
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="task-actions">
              <button 
                className="icon-button edit-button" 
                onClick={() => navigate(`/task/${task.id}`)}
                title="Edit Task"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button 
                className="icon-button delete-button" 
                onClick={() => deleteTask(task.id)}
                title="Delete Task"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </li>
        ))}
        {filteredTasks.length === 0 && (
          <li className="no-tasks">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <p>No tasks found</p>
            <p className="no-tasks-subtitle">Add a new task to get started</p>
          </li>
        )}
      </ul>
    </div>
  );
}

export default TaskList;