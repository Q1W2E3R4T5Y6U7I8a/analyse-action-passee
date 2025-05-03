import React, { useState } from 'react';
import DailyEntry from './components/DailyEntry';
import GoalTracker from './components/GoalTracker';
import Statistics from './components/Statistics';
import './App.scss';

function App() {
  const [page, setPage] = useState('daily');

  return (
    <div className="app-container">
      <nav className="main-nav">
        <div className="nav-container">
          <button 
            onClick={() => setPage('daily')}
            className={`nav-button ${page === 'daily' ? 'active' : ''}`}
          >
            <span className="nav-icon">📅</span>
            <span className="nav-text">Daily Journal</span>
          </button>
          <button 
            onClick={() => setPage('goals')}
            className={`nav-button ${page === 'goals' ? 'active' : ''}`}
          >
            <span className="nav-icon">🎯</span>
            <span className="nav-text">Goals</span>
          </button>
          <button 
            onClick={() => setPage('stats')}
            className={`nav-button ${page === 'stats' ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Statistics</span>
          </button>
        </div>
      </nav>

      <main className="main-content">
        {page === 'daily' && <DailyEntry />}
        {page === 'goals' && <GoalTracker />}
        {page === 'stats' && <Statistics />}
      </main>
    </div>
  );
}

export default App;