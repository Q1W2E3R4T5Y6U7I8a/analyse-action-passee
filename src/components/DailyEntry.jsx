import React, { useState, useRef, useEffect, useCallback } from 'react';
import { format, subDays, addDays, parse } from 'date-fns';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './DailyEntry.scss';
import { loadData, saveData } from '../services/dataService';

const initialState = {
  date: format(new Date(), 'dd/MM/yyyy'),
  efficiency: null,
  habits: [
    {
      id: 1,
      text: 'Exercise',
      completedByDate: {
        'dd/MM/yyyy': true,
        '29/07/2025': false,
      }
    },
    {
      id: 2,
      text: 'Meditation',
      completedByDate: {
        'dd/MM/yyyy': true,
        '29/07/2025': false,
      }
    },
  ],
  productivity: null,
  happiness: null,
  pomodoros: 0,
  pomodorosHistory: {
    '30': 0,
    '45': 0,
    '60': 0,
    'custom': 0
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
    { id: 1, text: 'Complete project proposal', completed: false },
    { id: 2, text: 'Schedule team meeting', completed: false },
    { id: 3, text: 'Review client feedback', completed: false },
  ],
  mostImportantTask: ''
};

// URL de ton Google Apps Script
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxGBuCB6ZbuPJy0UEPN1UTkADKhO9zSdTbi28vzKhFrtQ2rj7mTUk3US3o_4-lsZ5ZVOg/exec';

// Fonction pour sauvegarder dans Google Sheets
const saveToGoogleSheets = async (entry) => {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'dailyEntry',
        date: entry.date,
        efficiency: entry.efficiency || 0,
        productivity: entry.productivity || 0,
        happiness: entry.happiness || 0,
        pomodoros: entry.pomodoros || 0,
        energy: entry.energy || {},
        victory: entry.victory || '',
        loss: entry.loss || '',
        insight: entry.insight || '',
        mostImportantTask: entry.mostImportantTask || '',
        habits: entry.habits || [],
        todos: entry.todos || []
      })
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error saving to Google Sheets:', error);
    throw error;
  }
};

const AutoResizeTextarea = ({ value, onChange, placeholder, className, autoFocus }) => {
  const textareaRef = useRef(null);
  
  const adjustHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, []);
  
  useEffect(() => {
    adjustHeight();
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [adjustHeight, autoFocus, value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      onInput={adjustHeight}
      rows={1}
    />
  );
};

export default function DailyEntry() {
  const [entry, setEntry] = useState(initialState);
  const [history, setHistory] = useState([]);
  const [audio, setAudio] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [newTodoId, setNewTodoId] = useState(null);
  const [syncStatus, setSyncStatus] = useState('');

  // États unifiés pour le Pomodoro
  const [isPomodoroActive, setIsPomodoroActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [pomodoroDuration, setPomodoroDuration] = useState(45); // Durée par défaut en minutes
  const [timerEndTime, setTimerEndTime] = useState(null);
  const timerRef = useRef(null);

  const tracks = [
    "https://github.com/Q1W2E3R4T5Y6U7I8a/analyse-action-passee/raw/main/public/timer_music_1.mp3",
    "https://github.com/Q1W2E3R4T5Y6U7I8a/analyse-action-passee/raw/main/public/timer_music_2.mp3",
    "https://github.com/Q1W2E3R4T5Y6U7I8a/analyse-action-passee/raw/main/public/timer_music_3.mp3",
    "https://github.com/Q1W2E3R4T5Y6U7I8a/analyse-action-passee/raw/main/public/timer_music_4.mp3",
    "https://github.com/Q1W2E3R4T5Y6U7I8a/analyse-action-passee/raw/main/public/timer_music_5.mp3"
  ];

  const changeDateBy = useCallback((days) => {
    const parsedDate = parse(entry.date, 'dd/MM/yyyy', new Date());
    const newDate = format(addDays(parsedDate, days), 'dd/MM/yyyy');

    const prevEntry = history.find(e => e.date === entry.date);
    const found = history.find(e => e.date === newDate);

    const copiedHabits = prevEntry?.habits?.map(h => ({
      ...h,
      completedByDate: {
        ...h.completedByDate,
        [newDate]: h.completedByDate?.[newDate] ?? false
      }
    })) || [];

    const copiedTodos = prevEntry?.todos || initialState.todos;

    setEntry(found
      ? {
          ...found,
          habits: copiedHabits.length ? copiedHabits : found.habits || [],
          todos: found.todos || copiedTodos,
          mostImportantTask: found.mostImportantTask ?? prevEntry?.mostImportantTask ?? ''
        }
      : {
          ...initialState,
          date: newDate,
          habits: copiedHabits,
          todos: copiedTodos,
          mostImportantTask: prevEntry?.mostImportantTask ?? ''
        }
    );
  }, [entry.date, history]);

  // Fonction pour synchroniser avec Google Sheets
  const syncWithGoogleSheets = async () => {
    try {
      setSyncStatus('Synchronisation...');
      await saveToGoogleSheets(entry);
      setSyncStatus('✅ Données sauvegardées dans Google Sheets!');
      setTimeout(() => setSyncStatus(''), 3000);
    } catch (error) {
      setSyncStatus('❌ Erreur de synchronisation');
      setTimeout(() => setSyncStatus(''), 3000);
    }
  };

  // Auto-save whenever entry changes
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (entry.date) {
        const existingIndex = history.findIndex(e => e.date === entry.date);
        const updated = [...history];
        
        if (existingIndex >= 0) {
          updated[existingIndex] = entry;
        } else {
          updated.push(entry);
        }
        
        saveData(updated);
        setHistory(updated);
      }
    }, 500);
    
    return () => clearTimeout(saveTimer);
  }, [entry, history]);

  // Load saved data
  useEffect(() => {
    const saved = loadData();
    setHistory(saved || []);

    const prevDate = format(subDays(new Date(), 1), 'dd/MM/yyyy');
    const prevEntry = saved?.find(e => e.date === prevDate);
    const todayEntry = saved?.find(e => e.date === format(new Date(), 'dd/MM/yyyy'));

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
        pomodorosHistory: prevEntry.pomodorosHistory || initialState.pomodorosHistory,
        habits: prevEntry.habits?.map(h => ({
          ...h,
          completedByDate: {
            ...h.completedByDate,
            [format(new Date(), 'dd/MM/yyyy')]: false
          }
        })) || initialState.habits,
        todos: prevEntry.todos || initialState.todos
      });
    }
  }, []);

  // Timer effect unifié
  useEffect(() => {
    if (isPomodoroActive && timerEndTime) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((timerEndTime - now) / 1000));
        
        setTimeLeft(remaining);
        
        // Mettre à jour le titre de la page
        document.title = `${formatTime(remaining)} - Pomodoro Timer`;
        
        if (remaining === 0) {
          handlePomodoroEnd();
        }
      }, 100); // Vérifier plus fréquemment pour plus de précision
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPomodoroActive, timerEndTime]);

  // Gérer le changement de visibilité de la page pour la précision du timer
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isPomodoroActive && timerEndTime) {
        const remaining = Math.max(0, Math.floor((timerEndTime - Date.now()) / 1000));
        setTimeLeft(remaining);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.title = 'Daily Entry'; // Réinitialiser le titre quand le composant se démonte
    };
  }, [isPomodoroActive, timerEndTime]);

  // Audio cleanup
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
      }
      document.title = 'Daily Entry';
    };
  }, [audio]);

  const handleChange = (key, value) => {
    setEntry(prev => ({ ...prev, [key]: value }));
  };

  const handleEnergy = (key, value) => {
    setEntry(prev => ({
      ...prev,
      energy: { ...prev.energy, [key]: value }
    }));
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

  // Fonctions unifiées pour le Pomodoro
  const startPomodoro = (duration) => {
    const durationInMinutes = typeof duration === 'number' ? duration : pomodoroDuration;
    const durationInSeconds = durationInMinutes * 60;
    
    setIsPomodoroActive(true);
    setTimeLeft(durationInSeconds);
    setTimerEndTime(Date.now() + durationInSeconds * 1000);
    
    if (typeof duration === 'number') {
      setPomodoroDuration(duration);
    }
  };

  const handlePomodoroEnd = () => {
    clearInterval(timerRef.current);
    setIsPomodoroActive(false);
    document.title = 'Daily Entry';

    // Calculer le nombre de pomodoros (45min = 1 pomodoro)
    const pomodoroUnits = pomodoroDuration / 45;

    setEntry(prev => ({
      ...prev,
      pomodoros: parseFloat(((prev.pomodoros || 0) + pomodoroUnits).toFixed(2)),
      pomodorosHistory: {
        ...prev.pomodorosHistory,
        [pomodoroDuration]: parseFloat(((prev.pomodorosHistory?.[pomodoroDuration] || 0) + pomodoroUnits).toFixed(2))
      }
    }));

    if (!isMuted) {
      const randomTrack = Math.floor(Math.random() * tracks.length);
      const newAudio = new Audio(tracks[randomTrack]);
      newAudio.play();
      setAudio(newAudio);
    }
  };

  const cancelPomodoro = () => {
    clearInterval(timerRef.current);
    setIsPomodoroActive(false);
    setTimeLeft(0);
    document.title = 'Daily Entry';
    
    if (audio) {
      audio.pause();
    }
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

  const addNewTodo = () => {
    const newId = Date.now();
    setNewTodoId(newId);
    setEntry(prev => ({
      ...prev,
      todos: [
        ...prev.todos,
        { id: newId, text: '', completed: false }
      ]
    }));
  };

  const deleteTodo = (id) => {
    setEntry(prev => ({
      ...prev,
      todos: prev.todos.filter(todo => todo.id !== id)
    }));
  };

  const deleteHabit = (id) => {
    setEntry(prev => ({
      ...prev,
      habits: prev.habits.filter(habit => habit.id !== id)
    }));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(entry.todos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setEntry(prev => ({
      ...prev,
      todos: items
    }));
  };

  const moveTodo = (id, direction) => {
    const todos = [...entry.todos];
    const index = todos.findIndex(todo => todo.id === id);
    
    if ((direction === 'up' && index > 0) || 
        (direction === 'down' && index < todos.length - 1)) {
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      
      [todos[index], todos[newIndex]] = [todos[newIndex], todos[index]];
      
      setEntry(prev => ({
        ...prev,
        todos
      }));
    }
  };

  return (
    <div className="daily-entry">
      {/* Bouton de synchronisation */}
      <div className="sync-section" style={{ marginBottom: '20px', textAlign: 'center' }}>
        <button 
          onClick={syncWithGoogleSheets}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          💾 Sauvegarder dans Google Sheets
        </button>
        {syncStatus && (
          <div style={{ 
            marginTop: '10px', 
            padding: '10px',
            backgroundColor: syncStatus.includes('✅') ? '#4CAF50' : '#ff4444',
            color: 'white',
            borderRadius: '5px'
          }}>
            {syncStatus}
          </div>
        )}
      </div>

      {/* Section Pomodoro unifiée */}
      <div className="pomodoro-section" style={{ 
        marginBottom: '20px', 
        padding: '20px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '10px',
        textAlign: 'center'
      }}>
        {isPomodoroActive ? (
          <div className="active-pomodoro">
            <div className="timer-display" style={{ 
              fontSize: '48px', 
              fontWeight: 'bold',
              marginBottom: '15px'
            }}>
              {formatTime(timeLeft)}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <button onClick={cancelPomodoro} className="cancel-pomodoro" style={{
                padding: '8px 16px',
                margin: '0 5px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}>
                Annuler
              </button>
              <button onClick={toggleMute} className="mute-button" style={{
                padding: '8px 16px',
                margin: '0 5px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}>
                {isMuted ? '🔇' : '🔊'}
              </button>
            </div>
          </div>
        ) : (
          <div className="pomodoro-controls">
            <div style={{ marginBottom: '15px' }}>
              <input
                type="number"
                min="1"
                max="180"
                value={pomodoroDuration}
                onChange={(e) => setPomodoroDuration(parseInt(e.target.value) || 1)}
                className="custom-duration-input"
                style={{
                  padding: '10px',
                  marginRight: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                  width: '80px',
                  fontSize: '16px'
                }}
              />
              <button 
                onClick={() => startPomodoro()} 
                className="start-pomodoro"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Start {pomodoroDuration}m Pomodoro
              </button>
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
              {pomodoroDuration}min = {(pomodoroDuration / 45).toFixed(2)} pomodoro(s)
            </div>
            
            {/* Boutons rapides */}
            <div className="quick-pomodoros">
              <button 
                onClick={() => startPomodoro(30)} 
                className="pomodoro-button"
                style={{
                  padding: '8px 16px',
                  margin: '0 5px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                30m (0.66)
              </button>
              <button 
                onClick={() => startPomodoro(45)} 
                className="pomodoro-button"
                style={{
                  padding: '8px 16px',
                  margin: '0 5px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                45m (1.00)
              </button>
              <button 
                onClick={() => startPomodoro(60)} 
                className="pomodoro-button"
                style={{
                  padding: '8px 16px',
                  margin: '0 5px',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                60m (1.33)
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="card">
        <div className="section-box date-section">
          <div className="date-controls">
            <button type="button" onClick={() => changeDateBy(-1)}>&larr; Yesterday</button>
            <input 
              type="date"
              value={entry.date.split('/').reverse().join('-')}
              onChange={handleDateChange}
              className="date-picker"
            />
            <button type="button" onClick={() => changeDateBy(1)}>Tomorrow &rarr;</button>
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
                  step="0.01"
                  value={entry.pomodoros} 
                  onChange={e => handleChange('pomodoros', parseFloat(e.target.value))}
                  className="pomodoros-input"
                />
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  (45min = 1 pomodoro)
                </div>
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
                  rows="6"
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
                  rows="6"
                />
              </div>
              <div className="insight-card insight-card">
                <label className="input-label">🤔 Insights</label>
                <textarea 
                  value={entry.insight} 
                  onChange={e => handleChange('insight', e.target.value)} 
                  placeholder="Did you learn something today?"
                  className="insight-textarea"
                  rows="6"
                />
              </div>
            </div>
          </div>
          
         <div className="section-box todos-section">
  <h3 className="section-subtitle">Daily Tasks</h3>
  <div className="todos-grid">
    {entry.todos.map((todo, index) => (
      <div key={todo.id} className={`todo-card ${todo.completed ? 'completed' : ''}`}>
        <input
          type="checkbox"
          checked={todo.completed || false}
          onChange={(e) => handleTodoChange(todo.id, 'completed', e.target.checked)}
          className="todo-checkbox"
        />
        <AutoResizeTextarea
          value={todo.text || ''}
          onChange={(e) => handleTodoChange(todo.id, 'text', e.target.value)}
          placeholder="Enter a task..."
          className="todo-input"
          autoFocus={todo.id === newTodoId}
        />
        <div className="todo-priority-buttons">
          <button 
            onClick={() => moveTodo(todo.id, 'up')}
            disabled={index === 0}
            className="priority-button"
          >
            ↑
          </button>
          <button 
            onClick={() => moveTodo(todo.id, 'down')}
            disabled={index === entry.todos.length - 1}
            className="priority-button"
          >
            ↓
          </button>
        </div>
        <button 
          className="delete-todo"
          onClick={() => deleteTodo(todo.id)}
        >
          ×
        </button>
        {todo.completed && (
          <span className="completed-icon">✓</span>
        )}
      </div>
    ))}
    <button 
      className="add-todo-button"
      onClick={addNewTodo}
    >
      + Add Task
    </button>
  </div>
</div>
          
          <div className="section-box habits-section">
            <h3 className="section-subtitle">Habits Tracker</h3>
            <div className="habits-list">
              {(entry.habits || []).map((habit) => (
                <div key={habit.id} className="habit-item" style={{ minHeight: '50px' }}>
                  <input
                    type="checkbox"
                    checked={habit.completedByDate?.[entry.date] || false}
                    onChange={e => {
                      const newHabits = [...entry.habits];
                      const habitIndex = newHabits.findIndex(h => h.id === habit.id);
                      newHabits[habitIndex].completedByDate = {
                        ...newHabits[habitIndex].completedByDate,
                        [entry.date]: e.target.checked
                      };
                      setEntry(prev => ({ ...prev, habits: newHabits }));
                    }}
                  />
                  <AutoResizeTextarea
                    value={habit.text}
                    onChange={e => {
                      const newHabits = [...entry.habits];
                      const habitIndex = newHabits.findIndex(h => h.id === habit.id);
                      newHabits[habitIndex].text = e.target.value;
                      setEntry(prev => ({ ...prev, habits: newHabits }));
                    }}
                    placeholder="Enter habit..."
                    className="habit-input"
                  />
                  <button 
                    className="delete-habit"
                    onClick={() => deleteHabit(habit.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                className="add-habit-button"
                onClick={() => {
                  const newHabit = { 
                    id: Date.now(), 
                    text: '', 
                    completedByDate: {
                      [entry.date]: false
                    } 
                  };

                  setEntry(prev => ({
                    ...prev,
                    habits: prev.habits ? [...prev.habits, newHabit] : [newHabit]
                  }));
                }}
              >
                + Add Habit
              </button>
            </div>
          </div>
          
          <div className="section-box mit-section">
            <h3 className="section-subtitle">INTP confuse brainstorm with progress. <br/> Дія окреслює приорітети</h3>
            <textarea
              value={entry.mostImportantTask || ''}
              onChange={(e) => handleChange('mostImportantTask', e.target.value)}
              placeholder="What's the single, most important task you will dedicate at least 4–6 hours to?"
              className="mit-input"
              rows={4}
              style={{ width: '100%', marginTop: '12px', fontSize: '16px' }}
            />
          </div>
          
        </div>
      </div>
    </div>
  );
}