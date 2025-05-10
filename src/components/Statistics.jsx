import React, { useEffect, useState } from 'react';
import { loadData, deleteEntry, exportToJSON, importFromJSON } from '../services/dataService';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './Statistics.scss';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Statistics() {
  const [history, setHistory] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    setHistory(loadData());
  };

  const handleDeleteEntry = (dateToDelete) => {
    const updatedHistory = deleteEntry(dateToDelete);
    if (updatedHistory) {
      setHistory(updatedHistory);
      setConfirmDelete(null);
    }
  };

  const handleExport = () => {
    exportToJSON();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      importFromJSON(file)
        .then(data => {
          setHistory(data);
          alert('Data imported successfully!');
        })
        .catch(error => {
          console.error('Import error:', error);
          alert('Failed to import data. Please check the file format.');
        });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const [day, month, year] = dateString.split('/');
    const date = new Date(`${year}-${month}-${day}`);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (history.length === 0) {
    return (
      <div className="statistics-page">
        <div className="card empty-state">
          <h2 className="section-title">Statistics</h2>
          <p className="empty-message">No data available yet. Start by adding daily entries.</p>
        </div>
      </div>
    );
  }

  const dates = history.map(entry => formatDate(entry.date));

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          font: {
            size: 18,
            weight: 'bold',
            color: '#000'
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const formattedDate = formatDate(history[context.dataIndex].date);
            return `${context.dataset.label}: ${context.raw}% (${formattedDate})`;
          }
        },
        bodyFont: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#000',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          display: false
        }
      },
      y: { 
        min: 0, 
        max: 100,
        ticks: {
          color: '#000',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      }
    }
  };

  const pomodoroChartOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        min: 0,
        max: 30,
        title: {
          display: true,
          text: 'Minutes', // optional
          color: '#000',
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        ticks: {
          color: '#000',
          font: {
            size: 14,
            weight: 'bold'
          },
          callback: function(value) {
            return value; // <- removes any percentage formatting
          }
        }
      },
      x: {
        ticks: {
          color: '#000',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          display: false
        }
      }
    }
  };
  

  return (

    
    <div className="statistics-page">
      <div className="charts-container">
        <div className="chart-wrapper">

        

          <div className="chart-card">
            <div className="chart-container">
              <Line 
                data={{
                  labels: dates,
                  datasets: [
                    {
                      label: 'Efficiency',
                      data: history.map(entry => entry.efficiency),
                      borderColor: '#3b82f6',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      tension: 0.3,
                    },
                    {
                      label: 'Productivity',
                      data: history.map(entry => entry.productivity),
                      borderColor: '#10b981',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      tension: 0.3,
                    },
                    {
                      label: 'Happiness',
                      data: history.map(entry => entry.happiness),
                      borderColor: '#f59e0b',
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      tension: 0.3,
                    },
                  ],
                }} 
                options={chartOptions}
              />
            </div>
          </div>
        </div>

        <div className="chart-wrapper">
          <div className="chart-card">
            <div className="chart-container">
              <Bar 
                data={{
                  labels: dates,
                  datasets: [{
                    label: 'Pomodoros',
                    data: history.map(entry => entry.pomodoros),
                    backgroundColor: '#8b5cf6',
                    borderColor: '#7c3aed',
                  }],
                }} 
                options={pomodoroChartOptions} 
              />
            </div>
          </div>
        </div>

        <div className="chart-wrapper">
          <div className="chart-card">
            <div className="chart-container">
              <Line 
                data={{
                  labels: dates,
                  datasets: [
                    {
                      label: 'Air',
                      data: history.map(entry => entry.energy.air),
                      borderColor: '#94a3b8',
                      backgroundColor: 'rgba(148, 163, 184, 0.1)',
                      tension: 0.3,
                    },
                    {
                      label: 'Fire',
                      data: history.map(entry => entry.energy.fire),
                      borderColor: '#dc2626',
                      backgroundColor: 'rgba(220, 38, 38, 0.1)',
                      tension: 0.3,
                    },
                    {
                      label: 'Water',
                      data: history.map(entry => entry.energy.water),
                      borderColor: '#3b82f6',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      tension: 0.3,
                    },
                    {
                      label: 'Earth',
                      data: history.map(entry => entry.energy.earth),
                      borderColor: '#22c55e',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      tension: 0.3,
                    },
                  ],
                }} 
                options={chartOptions}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="insights-container">
        <div className="insights-column">
          <div className="insight-type victories-column">
            <h3 className="insights-title">✅ Victories</h3>
            <div className="insights-list">
              {history.filter(e => e.victory).map((entry, i) => (
                <div key={i} className="insight-item">
                  <div className="insight-header">
                    <div className="insight-date">{formatDate(entry.date)}</div>
                    <button 
                      className="delete-btn"
                      onClick={() => setConfirmDelete(entry.date)}
                    >
                      ×
                    </button>
                  </div>
                  <div className="insight-content">{entry.victory || 'No victory recorded'}</div>
                  {confirmDelete === entry.date && (
                    <div className="delete-confirmation">
                      <p>Delete this entry?</p>
                      <button onClick={() => handleDeleteEntry(entry.date)}>Yes</button>
                      <button onClick={() => setConfirmDelete(null)}>No</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="insight-type dreams-column">
            <h3 className="insights-title"> 💤 Dreams</h3>
            <div className="insights-list">
              {history.filter(e => e.loss).map((entry, i) => (
                <div key={i} className="insight-item">
                  <div className="insight-header">
                    <div className="insight-date">{formatDate(entry.date)}</div>
                    <button 
                      className="delete-btn"
                      onClick={() => setConfirmDelete(entry.date)}
                    >
                      ×
                    </button>
                  </div>
                  <div className="insight-content">{entry.loss || 'No loss recorded'}</div>
                  {confirmDelete === entry.date && (
                    <div className="delete-confirmation">
                      <p>Delete this entry?</p>
                      <button onClick={() => handleDeleteEntry(entry.date)}>Yes</button>
                      <button onClick={() => setConfirmDelete(null)}>No</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="insight-type insights-column">
            <h3 className="insights-title">🤔 Insights</h3>
            <div className="insights-list">
              {history.filter(e => e.insight).map((entry, i) => (
                <div key={i} className="insight-item">
                  <div className="insight-header">
                    <div className="insight-date">{formatDate(entry.date)}</div>
                    <button 
                      className="delete-btn"
                      onClick={() => setConfirmDelete(entry.date)}
                    >
                      ×
                    </button>
                  </div>
                  <div className="insight-content">{entry.insight || 'No insight recorded'}</div>
                  {confirmDelete === entry.date && (
                    <div className="delete-confirmation">
                      <p>Delete this entry?</p>
                      <button onClick={() => handleDeleteEntry(entry.date)}>Yes</button>
                      <button onClick={() => setConfirmDelete(null)}>No</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="insight-type todos-column">
            <h3 className="insights-title">📝 Todos</h3>
            <div className="insights-list">
              {history.filter(e => e.todos && e.todos.length > 0).map((entry, i) => (
                <div key={i} className="insight-item">
                  <div className="insight-header">
                    <div className="insight-date">{formatDate(entry.date)}</div>
                    <button 
                      className="delete-btn"
                      onClick={() => setConfirmDelete(entry.date)}
                    >
                      ×
                    </button>
                  </div>
                  <div className="insight-content">
                    <ul>
                      {entry.todos.map((todo, j) => (
                        <li key={j} className={todo.completed ? 'completed' : ''}>
                          {todo.text || 'Untitled Task'}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {confirmDelete === entry.date && (
                    <div className="delete-confirmation">
                      <p>Delete this entry?</p>
                      <button onClick={() => handleDeleteEntry(entry.date)}>Yes</button>
                      <button onClick={() => setConfirmDelete(null)}>No</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="data-actions">
          <button onClick={handleExport} className="export-button">
            Export to JSON
          </button>
          <label className="import-button">
            Import from JSON
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImport} 
              style={{ display: 'none' }} 
            />
          </label>
        </div>
    </div>
    
  );
}