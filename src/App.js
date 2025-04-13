import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Sidebar from './components/Sidebar';
import Timer from './components/Timer';
import TaskList from './components/TaskList';
import TaskDetail from './components/TaskDetail';
import Reports from './components/Reports';
import Settings from './components/Settings';
import { DataProvider } from './store/DataContext';

function App() {
  return (
    <DataProvider>
      <Router>
        <div className="app">
          <Sidebar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<><Timer /><TaskList /></>} />
              <Route path="/task/:id" element={<TaskDetail />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </div>
      </Router>
    </DataProvider>
  );
}

export default App;