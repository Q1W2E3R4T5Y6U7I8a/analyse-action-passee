import React, { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import './DailyEntry.scss';
import { loadData, saveData } from '../services/dataService';

const initialState = {
  date: format(new Date(), 'dd/MM/yyyy'),
  efficiency: null,
  productivity: null,
  happiness: null,
  pomodoros: 0,
  pomodorosHistory: {
    '30': 0,
    '45': 0,
    '60': 0
  },
  energy: {
    air: null,
    fire: null,
    water: null,
    earth: null,
  },
  victory: '',
  loss: '',
  insight: '',
  activePomodoro: null,
  pomodoroDuration: 30,
  todos: [
    { id: 1, text: '', completed: false },
    { id: 2, text: '', completed: false },
    { id: 3, text: '', completed: false },
  ]
};

export default function DailyEntry() {
  const [entry, setEntry] = useState(initialState);
  const [history, setHistory] = useState([]);
  const [timer, setTimer] = useState(null);
  const [isPomodoroActive, setIsPomodoroActive] = useState(false);
  const [audio, setAudio] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  useEffect(() => {
    const saved = loadData();
    setHistory(saved);
    
    const prevDate = format(subDays(new Date(), 1), 'dd/MM/yyyy');
    const prevEntry = saved.find(e => e.date === prevDate);
    const todayEntry = saved.find(e => e.date === format(new Date(), 'dd/MM/yyyy'));
    
    if (todayEntry) {
      setEntry(todayEntry);
    } else if (prevEntry) {
      setEntry({
        ...initialState,
        date: format(new Date(), 'dd/MM/yyyy'),
        efficiency: prevEntry.efficiency,
        productivity: prevEntry.productivity,
        happiness: prevEntry.happiness,
        energy: { ...prevEntry.energy },
        victory: prevEntry.victory || '',
        loss: prevEntry.loss || '',
        insight: prevEntry.insight || '',
        pomodorosHistory: prevEntry.pomodorosHistory || initialState.pomodorosHistory
      });
    }
  }, []); // Removed the duplicate useEffect
  
  useEffect(() => {
    let countdown;
    
    if (timer !== null && timer > 0) {
      countdown = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            handlePomodoroEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  
    return () => {
      if (countdown) clearInterval(countdown);
    };
  }, [timer, isPomodoroActive]);  

  const handleChange = (key, value) => {
    setEntry(prev => ({ ...prev, [key]: value }));
  };

  const handleEnergy = (key, value) => {
    setEntry(prev => ({
      ...prev,
      energy: { ...prev.energy, [key]: value }
    }));
  };

  const saveEntry = () => {
    if (entry.efficiency === null || entry.productivity === null || entry.happiness === null) {
      alert('Please fill all metrics (efficiency, productivity, happiness)');
      return;
    }
  
    if (!entry.victory.trim()) {
      alert('Victories field is required! Please note at least one positive thing from your day.');
      return;
    }
  
    const existingIndex = history.findIndex(e => e.date === entry.date);
    const updated = [...history];
  
    if (existingIndex >= 0) {
      updated[existingIndex] = entry;
      alert('Entry updated successfully!');
    } else {
      updated.push(entry);
      alert('New entry saved successfully!');
    }
  
    if (saveData(updated)) {
      setHistory(updated);
      setEntry(prev => ({
        ...initialState,
        date: format(new Date(), 'dd/MM/yyyy'),
        efficiency: prev.efficiency,
        productivity: prev.productivity,
        happiness: prev.happiness,
        energy: { ...prev.energy },
        victory: prev.victory,
        loss: prev.loss,
        insight: prev.insight,
        pomodorosHistory: { ...prev.pomodorosHistory },
        todos: prev.todos 
      }));
    }
  };

  const getMetricColor = (value) => {
    if (value === null) return '#94a3b8';
    if (value < 33) return '#dc2626';
    if (value < 66) return '#f59e0b';
    return '#10b981';
  };

  const handleDateChange = (e) => {
    const [year, month, day] = e.target.value.split('-');
    handleChange('date', `${day}/${month}/${year}`);
  };

  const startPomodoro = (duration) => {
    setIsPomodoroActive(true);
    setEntry(prev => ({
      ...prev,
      pomodoroDuration: duration
    }));
    setTimer(duration * 60);
  };

  const handlePomodoroEnd = () => {
    const duration = entry.pomodoroDuration.toString();
  
    setEntry(prev => ({
      ...prev,
      pomodoros: (prev.pomodoros || 0) + 1, // Fallback for pomodoros
      pomodorosHistory: {
        ...prev.pomodorosHistory, // Ensure pomodorosHistory exists
        [duration]: (prev.pomodorosHistory?.[duration] || 0) + 1 // Fallback for specific duration
      }
    }));
  
    if (!isMuted) {
      const randomTrack = Math.floor(Math.random() * 3) + 1;
      const newAudio = new Audio(`/timer_music_${randomTrack}.mp3`);
      newAudio.play();
      setAudio(newAudio);
    }
  
    setIsPomodoroActive(false);
    setTimer(null);
  };

  const toggleMute = () => {
    if (audio) {
      if (isMuted) {
        audio.play();
      } else {
        audio.pause();
      }
    }
    setIsMuted(!isMuted);
  };

  const cancelPomodoro = () => {
    setIsPomodoroActive(false);
    setTimer(null);
    if (audio) {
      audio.pause();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTodoChange = (id, key, value) => {
    setEntry(prev => ({
      ...prev,
      todos: prev.todos.map(todo => 
        todo.id === id ? { ...todo, [key]: value } : todo
      )
    }));
  };
  

  return (
    <div className="daily-entry">
      <div className="card">
        <div className="section-box date-section">
          <h2 className="section-title">Daily Journal</h2>
          <div className="date-container">
            <input 
              type="date" 
              value={entry.date.split('/').reverse().join('-')} 
              onChange={handleDateChange}
              className="date-picker"
            />
          </div>
        </div>

        <div className="bottom-section">
          <div className="section-box metrics-section">
            <h3 className="section-subtitle">Performance Metrics</h3>
            <div className="metrics-grid">
              {['efficiency', 'productivity', 'happiness'].map(metric => (
                <div key={metric} className="metric-card">
                  <label className="metric-label">
                    {metric.charAt(0).toUpperCase() + metric.slice(1)}
                    <span className="metric-value" style={{ color: getMetricColor(entry[metric]) }}>
                      {entry[metric] ?? ''}%
                    </span>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={entry[metric] ?? 50} 
                    onChange={e => handleChange(metric, +e.target.value)} 
                    className="metric-slider"
                    style={{ '--track-color': getMetricColor(entry[metric]) }}
                  />
                  <div className="slider-labels">
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>
              ))}
              <div className="metric-card pomodoros-card">
                <label className="input-label">Pomodoros Completed</label>
                <input 
                  type="number" 
                  min="0" 
                  value={entry.pomodoros} 
                  onChange={e => handleChange('pomodoros', +e.target.value)}
                  className="pomodoros-input"
                />
              </div>
            </div>
          </div>

          <div className="section-box energy-section">
            <h3 className="section-subtitle">Energy Levels</h3>
            <div className="energy-grid">
              {Object.entries(entry.energy).map(([key, value]) => (
                <div key={key} className={`energy-card energy-${key}`}>
                  <label className="energy-label">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                    <span className="energy-value">{value ?? ''}%</span>
                  </label>
                  <div className="energy-slider-container">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={value ?? 50} 
                      onChange={e => handleEnergy(key, +e.target.value)}
                      className="energy-slider"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section-box insights-section">
            <h3 className="section-subtitle">Daily Reflections</h3>
            <div className="insights-grid">
              <div className="insight-card victory-card">
                <label className="input-label"> ❌✅ Victories / Losses <span className="required">*</span></label>
                <textarea 
                  value={entry.victory} 
                  onChange={e => handleChange('victory', e.target.value)} 
                  placeholder="What went well today?"
                  className="insight-textarea"
                  rows="4"
                  required
                />
              </div>
              <div className="insight-card loss-card">
                <label className="input-label">💤 Dreams</label>
                <textarea 
                  value={entry.loss} 
                  onChange={e => handleChange('loss', e.target.value)} 
                  placeholder="What could be improved?"
                  className="insight-textarea"
                  rows="4"
                />
              </div>
              <div className="insight-card insight-card">
                <label className="input-label">🤔 Insights</label>
                <textarea 
                  value={entry.insight} 
                  onChange={e => handleChange('insight', e.target.value)} 
                  placeholder="Did you learn something today?"
                  className="insight-textarea"
                  rows="4"
                />
              </div>
              
            </div>
            
          </div>
          <div className="section-box todos-section">
              <h3 className="section-subtitle">Daily Tasks</h3>
              <div className="todos-grid">
                {(entry.todos || []).map((todo) => ( // Fallback to an empty array
                  <div 
                    key={todo.id} 
                    className={`todo-card ${todo.completed ? 'completed' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={(e) => handleTodoChange(todo.id, 'completed', e.target.checked)}
                      className="todo-checkbox"
                    />
                    <input
                      type="text"
                      value={todo.text}
                      onChange={(e) => handleTodoChange(todo.id, 'text', e.target.value)}
                      placeholder="Enter a task..."
                      className="todo-input"
                    />
                    {todo.completed && (
                      <span className="completed-icon">✓</span>
                    )}
                  </div>
                ))}
                <button 
                  className="add-todo-button"
                  onClick={() => {
                    setEntry(prev => ({
                      ...prev,
                      todos: [
                        ...(prev.todos || []), // Ensure todos is an array
                        { id: Date.now(), text: '', completed: false }
                      ]
                    }));
                  }}
                >
                  + Add Task
                </button>
              </div>
            </div>
        </div>

        <button className="save-button" onClick={saveEntry}>
          Save Daily Entry
        </button>

        <div className="pomodoro-section">
          <div className="pomodoro-timer">
            {isPomodoroActive ? (
              <div className="pomodoro-active">
                <div className="timer-display">
                  <span className="time">{formatTime(timer)}</span>
                  <span className="label">remaining</span>
                </div>
                <div className="pomodoro-controls">
                  <button className="cancel-button" onClick={cancelPomodoro}>
                    Cancel
                  </button>
                  <button 
                    className={`mute-button ${isMuted ? 'muted' : ''}`} 
                    onClick={toggleMute}
                  >
                    {isMuted ? '🔇' : '🔊'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="pomodoro-setup">
                <h3 className="pomodoro-title">Start Pomodoro Session</h3>
                <div className="duration-buttons">
                  <button 
                    className="duration-button" 
                    onClick={() => startPomodoro(30)}
                  >
                    30 min
                  </button>
                  <button 
                    className="duration-button" 
                    onClick={() => startPomodoro(45)}
                  >
                    45 min
                  </button>
                  <button 
                    className="duration-button" 
                    onClick={() => startPomodoro(60)}
                  >
                    60 min
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}