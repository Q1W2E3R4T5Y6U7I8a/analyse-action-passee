import React, { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import './DailyEntry.scss';

const initialState = {
  date: format(new Date(), 'dd/MM/yyyy'),
  efficiency: null,
  productivity: null,
  happiness: null,
  pomodoros: 0,
  energy: {
    air: null,
    fire: null,
    water: null,
    earth: null,
  },
  victory: '',
  loss: '',
  insight: ''
};

export default function DailyEntry() {
  const [entry, setEntry] = useState(initialState);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('daily-log')) || [];
    setHistory(saved);
    
    const prevDate = format(subDays(new Date(), 1), 'dd/MM/yyyy');
    const prevEntry = saved.find(e => e.date === prevDate);
    
    if (prevEntry) {
      setEntry({
        ...initialState,
        date: format(new Date(), 'dd/MM/yyyy'),
        efficiency: prevEntry.efficiency,
        productivity: prevEntry.productivity,
        happiness: prevEntry.happiness,
        energy: { ...prevEntry.energy }
      });
    }
  }, []);

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

    const existingIndex = history.findIndex(e => e.date === entry.date);
    const updated = [...history];
    
    if (existingIndex >= 0) {
      updated[existingIndex] = entry;
      alert('Existing entry updated successfully!');
    } else {
      updated.push(entry);
      alert('New entry saved successfully!');
    }

    setHistory(updated);
    localStorage.setItem('daily-log', JSON.stringify(updated));
    
    setEntry({
      ...initialState,
      date: format(new Date(), 'dd/MM/yyyy'),
      efficiency: entry.efficiency,
      productivity: entry.productivity,
      happiness: entry.happiness,
      energy: { ...entry.energy }
    });
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

  return (
    <div className="daily-entry">
      <div className="card">
        {/* Date Section - Full width at top */}
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

        {/* Bottom Section - 3 equal width boxes */}
        <div className="bottom-section">
          {/* Metrics Section */}
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

          {/* Energy Section */}
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

          {/* Insights Section */}
          <div className="section-box insights-section">
            <h3 className="section-subtitle">Daily Reflections</h3>
            <div className="insights-grid">
              <div className="insight-card victory-card">
                <label className="input-label">✅ Victories</label>
                <textarea 
                  value={entry.victory} 
                  onChange={e => handleChange('victory', e.target.value)} 
                  placeholder="What went well today?"
                  className="insight-textarea"
                  rows="4"
                />
              </div>
              <div className="insight-card loss-card">
                <label className="input-label">❌ Losses</label>
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
        </div>

        <button className="save-button" onClick={saveEntry}>
          Save Daily Entry
        </button>
      </div>
    </div>
  );
}