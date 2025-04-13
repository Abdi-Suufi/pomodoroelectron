import React, { useState } from 'react';
import { useData } from '../store/DataContext';

function Settings() {
  const { settings, updateSettings } = useData();
  const [formValues, setFormValues] = useState({
    workTime: settings.workTime,
    breakTime: settings.breakTime,
    longBreakTime: settings.longBreakTime
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: parseInt(value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings(formValues);
    // Show success message
    setSyncMessage({ type: 'success', text: 'Settings saved successfully!' });
    setTimeout(() => setSyncMessage(null), 3000);
  };

  const simulateSync = () => {
    setIsSyncing(true);
    // Simulate API call to sync data
    setTimeout(() => {
      setIsSyncing(false);
      setSyncMessage({ type: 'success', text: 'Data synchronized successfully!' });
      setTimeout(() => setSyncMessage(null), 3000);
    }, 2000);
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      
      <div className="settings-section">
        <h3>Timer Settings</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="workTime">Work Time (minutes)</label>
            <input
              type="number"
              id="workTime"
              name="workTime"
              value={formValues.workTime}
              onChange={handleChange}
              min="1"
              max="60"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="breakTime">Short Break (minutes)</label>
            <input
              type="number"
              id="breakTime"
              name="breakTime"
              value={formValues.breakTime}
              onChange={handleChange}
              min="1"
              max="30"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="longBreakTime">Long Break (minutes)</label>
            <input
              type="number"
              id="longBreakTime"
              name="longBreakTime"
              value={formValues.longBreakTime}
              onChange={handleChange}
              min="5"
              max="60"
            />
          </div>
          
          <button type="submit">Save Settings</button>
        </form>
      </div>
      
      <div className="settings-section">
        <h3>Data Synchronization</h3>
        <p>Synchronize your data across all your devices.</p>
        
        <button 
          onClick={simulateSync} 
          disabled={isSyncing}
          className={isSyncing ? 'syncing' : ''}
        >
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>
        
        {syncMessage && (
          <div className={`sync-message ${syncMessage.type}`}>
            {syncMessage.text}
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;