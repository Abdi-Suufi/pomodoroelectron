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
        <label>
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={() => setShowCompleted(!showCompleted)}
          />
          Show Completed Tasks
        </label>
      </div>
      
      <form onSubmit={handleSubmit} className="new-task-form">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a new task..."
        />
        <button type="submit">Add</button>
      </form>
      
      <ul className="task-list">
        {filteredTasks.map(task => (
          <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
            <div className="task-info">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTaskCompletion(task.id)}
              />
              <div className="task-details">
                <h3 onClick={() => navigate(`/task/${task.id}`)}>{task.title}</h3>
                {task.dueDate && (
                  <span className="due-date">
                    Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  </span>
                )}
                {task.subtasks.length > 0 && (
                  <div className="subtask-progress">
                    <progress 
                      value={task.subtasks.filter(st => st.completed).length} 
                      max={task.subtasks.length}
                    />
                    <span>
                      {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="task-actions">
              <button onClick={() => navigate(`/task/${task.id}`)}>Edit</button>
              <button onClick={() => deleteTask(task.id)}>Delete</button>
            </div>
          </li>
        ))}
        {filteredTasks.length === 0 && (
          <li className="no-tasks">No tasks found</li>
        )}
      </ul>
    </div>
  );
}

export default TaskList;