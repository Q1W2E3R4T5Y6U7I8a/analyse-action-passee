import React, { useState } from 'react';
import DailyEntry from './components/DailyEntry';
import GoalTracker from './components/GoalTracker';
import Statistics from './components/Statistics';
import './App.scss';
import Dreams from './components/Dreams'; 
import Insights from './Insights'; 

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
          <button 
            onClick={() => setPage('dreams')}
            className={`nav-button ${page === 'dreams' ? 'active' : ''}`}
          >
            <span className="nav-icon">✨</span>
            <span className="nav-text">Dreams</span>
          </button>
          
          <button
            onClick={() => window.location.href='https://docs.google.com/spreadsheets/d/11hrKhl-S0aJnrsp_Gngk0uJDks_MFOsdwy7WmYEuCRE/edit?usp=sharing'}
            className="nav-button"
          >
            <span className="nav-icon">💰</span>
            <span className="nav-text">Finance</span>
          </button>

          <button
            onClick={() => window.location.href='https://forextheoryofpossibilities.vercel.app/main.html'}
            className="nav-button"
          >
            <span className="nav-icon">📈</span>
            <span className="nav-text">Trading</span>
          </button>

          <button
            onClick={() => setPage('insights')}
            className={`nav-button ${page === 'insights' ? 'active' : ''}`}
          >
            <span className="nav-icon">🔍</span>
            <span className="nav-text">Insights</span>
          </button>
        </div>
      </nav>

      <main className="main-content">
        {page === 'dreams' && <Dreams />}
        {page === 'daily' && <DailyEntry />}
        {page === 'goals' && <GoalTracker />}
        {page === 'stats' && <Statistics />}
         {page === 'insights' && <Insights />}
      </main>
    </div>
  );
}

export default App;