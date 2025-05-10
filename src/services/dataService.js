// src/services/dataService.js

const DATA_KEY = 'daily-log';

export const loadData = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(DATA_KEY)) || [];
    return saved.sort((a, b) => {
      const [dayA, monthA, yearA] = a.date.split('/');
      const [dayB, monthB, yearB] = b.date.split('/');
      return new Date(`${yearA}-${monthA}-${dayA}`) - new Date(`${yearB}-${monthB}-${dayB}`);
    });
  } catch (error) {
    console.error('Error loading data:', error);
    return [];
  }
};

export const saveData = (data) => {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
};

export const deleteEntry = (date) => {
  try {
    const currentData = loadData();
    const updatedData = currentData.filter(entry => entry.date !== date);
    saveData(updatedData);
    return updatedData;
  } catch (error) {
    console.error('Error deleting entry:', error);
    return null;
  }
};

export const exportToJSON = () => {
  const data = loadData();
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'daily-log-export.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const importFromJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (Array.isArray(data)) {
          saveData(data);
          resolve(data);
        } else {
          reject(new Error('Invalid data format'));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};