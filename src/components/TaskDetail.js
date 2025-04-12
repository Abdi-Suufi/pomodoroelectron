import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { useData } from '../store/DataContext';

function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, updateTask } = useData();
  
  const [task, setTask] = useState(null);
  const [editedTask, setEditedTask] = useState(null);
  const [newSubtask, setNewSubtask] = useState('');
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    const foundTask = tasks.find(t => t.id === id);
    if (foundTask) {
      setTask(foundTask);
      setEditedTask({...foundTask});
    } else {
      navigate('/'); // Task not found, redirect to home
    }
  }, [id, tasks, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editedTask) {
      updateTask(id, editedTask);
      navigate('/');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({
      ...prev,
      [name]: value ? new Date(value).toISOString() : null
    }));
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setEditedTask(prev => ({
        ...prev,
        subtasks: [
          ...prev.subtasks,
          { id: uuidv4(), title: newSubtask.trim(), completed: false }
        ]
      }));
      setNewSubtask('');
    }
  };

  const toggleSubtaskCompletion = (subtaskId) => {
    setEditedTask(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(st => 
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      )
    }));
  };

  const removeSubtask = (subtaskId) => {
    setEditedTask(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(st => st.id !== subtaskId)
    }));
  };

  const addNote = () => {
    if (newNote.trim()) {
      const updatedNotes = editedTask.notes 
        ? `${editedTask.notes}\n\n${newNote.trim()}`
        : newNote.trim();
      
      setEditedTask(prev => ({
        ...prev,
        notes: updatedNotes
      }));
      setNewNote('');
    }
  };

  if (!task || !editedTask) {
    return <div>Loading...</div>;
  }

  return (
    <div className="task-detail-container">
      <button onClick={() => navigate('/')} className="back-button">← Back</button>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={editedTask.title}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={editedTask.description}
            onChange={handleChange}
            rows="3"
          />
        </div>
        
        <div className="form-group">
          <label>Status</label>
          <select name="completed" value={editedTask.completed} onChange={(e) => {
            setEditedTask(prev => ({
              ...prev,
              completed: e.target.value === 'true'
            }));
          }}>
            <option value="false">In Progress</option>
            <option value="true">Completed</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={editedTask.dueDate ? format(new Date(editedTask.dueDate), 'yyyy-MM-dd') : ''}
            onChange={handleDateChange}
          />
        </div>
        
        <div className="form-group">
          <label>Reminder</label>
          <input
            type="datetime-local"
            name="reminder"
            value={editedTask.reminder ? format(new Date(editedTask.reminder), "yyyy-MM-dd'T'HH:mm") : ''}
            onChange={handleDateChange}
          />
        </div>
        
        <div className="form-group">
          <label>Repeat</label>
          <select name="repeat" value={editedTask.repeat || ''} onChange={handleChange}>
            <option value="">No Repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Subtasks</label>
          <div className="subtask-add">
            <input
              type="text"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              placeholder="New subtask..."
            />
            <button type="button" onClick={addSubtask}>Add</button>
          </div>
          
          <ul className="subtask-list">
            {editedTask.subtasks.map(subtask => (
              <li key={subtask.id}>
                <input
                  type="checkbox"
                  checked={subtask.completed}
                  onChange={() => toggleSubtaskCompletion(subtask.id)}
                />
                <span className={subtask.completed ? 'completed' : ''}>
                  {subtask.title}
                </span>
                <button type="button" onClick={() => removeSubtask(subtask.id)}>×</button>
              </li>
            ))}
            {editedTask.subtasks.length === 0 && (
              <li className="no-subtasks">No subtasks</li>
            )}
          </ul>
        </div>
        
        <div className="form-group">
          <label>Notes</label>
          <div className="note-add">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note..."
              rows="2"
            />
            <button type="button" onClick={addNote}>Add Note</button>
          </div>
          
          <div className="notes-display">
            {editedTask.notes ? (
              <pre>{editedTask.notes}</pre>
            ) : (
              <p className="no-notes">No notes</p>
            )}
          </div>
        </div>
        
        <div className="form-group">
          <label>Pomodoros Completed</label>
          <div className="pomodoro-counter">
            {editedTask.pomodorosCompleted}
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit">Save Changes</button>
        </div>
      </form>
    </div>
  );
}

export default TaskDetail;