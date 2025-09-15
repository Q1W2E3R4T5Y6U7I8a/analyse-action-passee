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
    { id: 1, text: 'Complete project proposal', completed: false },
    { id: 2, text: 'Schedule team meeting', completed: false },
    { id: 3, text: 'Review client feedback', completed: false },
  ],
  mostImportantTask: ''
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
  const [timer, setTimer] = useState(null);
  const [isPomodoroActive, setIsPomodoroActive] = useState(false);
  const [audio, setAudio] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [newTodoId, setNewTodoId] = useState(null);

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

  // Pomodoro timer effect
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

  // Audio cleanup
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
      }
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
      pomodoros: (prev.pomodoros || 0) + 1,
      pomodorosHistory: {
        ...prev.pomodorosHistory,
        [duration]: (prev.pomodorosHistory?.[duration] || 0) + 1
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
  //#POMODORO
  const [customTimeLeft, setCustomTimeLeft] = useState(60 * 60); // 60 minutes in seconds
  const [isCustomPomodoroActive, setIsCustomPomodoroActive] = useState(false);
  const [customTimerEndTime, setCustomTimerEndTime] = useState(null);
  const customTimerRef = useRef(null);
   const startCustomPomodoro = () => {
    setIsCustomPomodoroActive(true);
    const endTime = Date.now() + 60 * 60 * 1000; // 60 minutes from now
    setCustomTimerEndTime(endTime);
    setCustomTimeLeft(60 * 60);
    
    // Start the timer
    customTimerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setCustomTimeLeft(remaining);
      
      // Update tab title with time remaining
      document.title = `${formatTime(remaining)} - Pomodoro Timer`;
      
      if (remaining === 0) {
        handleCustomPomodoroEnd();
      }
    }, 1000);
  };
  
  const tracks = [
    "https://github.com/Q1W2E3R4T5Y6U7I8a/analyse-action-passee/raw/main/public/timer_music_1.mp3",
  "https://github.com/Q1W2E3R4T5Y6U7I8a/analyse-action-passee/raw/main/public/timer_music_2.mp3",
  "https://github.com/Q1W2E3R4T5Y6U7I8a/analyse-action-passee/raw/main/public/timer_music_3.mp3",
  "https://github.com/Q1W2E3R4T5Y6U7I8a/analyse-action-passee/raw/main/public/timer_music_4.mp3",
  "https://github.com/Q1W2E3R4T5Y6U7I8a/analyse-action-passee/raw/main/public/timer_music_5.mp3"
];

const handleCustomPomodoroEnd = () => {
  clearInterval(customTimerRef.current);
  setIsCustomPomodoroActive(false);

  // Reset tab title
  document.title = 'Daily Entry';

  if (!isMuted) {
        const randomTrack = Math.floor(Math.random() * tracks.length);
    const newAudio = new Audio(tracks[randomTrack]);
    newAudio.play();
    setAudio(newAudio);
  }
};

   const cancelCustomPomodoro = () => {
    clearInterval(customTimerRef.current);
    setIsCustomPomodoroActive(false);
    setCustomTimeLeft(60 * 60);
    
    // Reset tab title
    document.title = 'Daily Entry';
    
    if (audio) {
      audio.pause();
    }
  };
  
  // Add this useEffect to handle tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isCustomPomodoroActive && customTimerEndTime) {
        // Recalculate time left when tab becomes visible again
        const remaining = Math.max(0, Math.floor((customTimerEndTime - Date.now()) / 1000));
        setCustomTimeLeft(remaining);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isCustomPomodoroActive, customTimerEndTime]);
  //##################

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
      <div className="custom-pomodoro-timer">
        {isCustomPomodoroActive ? (
          <>
            <div className="timer-display">{formatTime(customTimeLeft)}</div>
            <button onClick={cancelCustomPomodoro} className="cancel-pomodoro">
              Cancel
            </button>
            <button onClick={toggleMute} className="mute-button">
              {isMuted ? '🔇' : '🔊'}
            </button>
          </>
        ) : (
          <button onClick={startCustomPomodoro} className="start-pomodoro">
            Start 60m Pomodoro
          </button>
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

          {isPomodoroActive && (
            <div className="pomodoro-timer">
              <div className="timer-display">{formatTime(timer)}</div>
              <button onClick={cancelPomodoro} className="cancel-pomodoro">
                Cancel
              </button>
              <button onClick={toggleMute} className="mute-button">
                {isMuted ? '🔇' : '🔊'}
              </button>
            </div>
          )}
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
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="todos">
                {(provided) => (
                  <div 
                    className="todos-grid"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {entry.todos.map((todo, index) => (
                      <Draggable key={todo.id} draggableId={todo.id.toString()} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`todo-card ${todo.completed ? 'completed' : ''}`}
                            style={{
                              ...provided.draggableProps.style,
                              zIndex: entry.todos.length - index,
                              minHeight: '60px'
                            }}
                          >
                            <div className="todo-drag-handle" {...provided.dragHandleProps}>
                              ≡
                            </div>
                            <input
                              type="checkbox"
                              checked={todo.completed}
                              onChange={(e) => handleTodoChange(todo.id, 'completed', e.target.checked)}
                              className="todo-checkbox"
                            />
                            <AutoResizeTextarea
                              value={todo.text}
                              onChange={(e) => handleTodoChange(todo.id, 'text', e.target.value)}
                              placeholder="Enter a task..."
                              className="todo-input"
                              autoFocus={todo.id === newTodoId}
                            />
                            <div className="todo-priority-buttons">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveTodo(todo.id, 'up');
                                }}
                                disabled={index === 0}
                                className="priority-button"
                              >
                                ↑
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveTodo(todo.id, 'down');
                                }}
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
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    <button 
                      className="add-todo-button"
                      onClick={addNewTodo}
                    >
                      + Add Task
                    </button>
                  </div>
                )}
              </Droppable>
            </DragDropContext>
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
              placeholder="What’s the single, most important task you will dedicate at least 4–6 hours to?"
              className="mit-input"
              rows={4}
              style={{ width: '100%', marginTop: '12px', fontSize: '16px' }}
            />
          </div>
          <iframe
                style={{ width: '100%', maxWidth: '360px', height: '360px' }}
                src="https://pomofocus.io/app"
                frameBorder="0"
              />
              <iframe
                style={{ width: '100%', maxWidth: '360px', height: '360px' }}
                src="https://stopwatch-app.com/widget/stopwatch?theme=light&color=indigo"
                frameBorder="0"
              />
      
        </div>
        
      </div>
    </div>
  );
}