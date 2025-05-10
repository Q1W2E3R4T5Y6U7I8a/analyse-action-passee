import React, { useState, useEffect } from 'react';
import './Dreams.scss';

const Dreams = () => {
  const [completedPastItems, setCompletedPastItems] = useState(() => {
    const savedCompletedItems = localStorage.getItem('completedDreamItems');
    return savedCompletedItems ? JSON.parse(savedCompletedItems) : [];
  });

  useEffect(() => {
    localStorage.setItem('completedDreamItems', JSON.stringify(completedPastItems));
  }, [completedPastItems]);

  const dreamsData = {
    past: [
      { id: -1, date: "Feb 2024", content: "Закінчи МА"},,
      { id: 0, date: "Feb 2024", content: "Вступи на Б1-Б2"},
      { id: 0.01, date: "2024", content: "Live for 3 days in mountains" },
      { id: 0.02, date: "2024", content: "Play in Switzerland, Monaco, French tournaments" },
      { id: 0.03, date: "2024", content: "Going to hitchhike across Europe for up to month"},
      { id: 0.1, date: "2024", content: "Warcraft 1500 ELO" },
      { id: 0.2, date: "2024", content: "Chess 1750 ELO" },
      { id: 1, date: "2023", content: "Complete Master's degree" },
      { id: 2, date: "2023", content: "Reach 1000 ELO in Chess" },
      { id: 3, date: "2022", content: "Learn basic French" },
      { id: 4, date: "2022", content: "First poker tournament" },
      { id: 5, date: "2021", content: "Move to Europe" },
      { id: 6, date: "2020", content: "Graduate University" }
    ],
    present: [
      { date: "By Sep 1", content: "Write a book, 200 pages" },
      { date: "By Sep 1", content: "Donate 500$" },
      { date: "By Sep 1", content: "Enroll to PowerCoders/uni" },
      { date: "By Sep 1", content: "Make 1 hr film about spiral dynamic" },
      { date: "By Sep 1", content: "Move to new place with internet Linux/Thor profficiency, proxy etc" },
    ],
    future: [
      { date: "2026", content: "Get 4k salary + 20k invested", },
      { date: "2026", content: "DUMY. TOP family. Build empire", },
      { date: "2026", content: "Ask out girl from Barcelona", },
      { date: "2030", content: "GCreate wonderful family", },
      { date: "Final Goals", content: "🌍 Freedom\n💧 Flawstate\n🔥 Love\n🪁 (Ego)Death",}
    ],
    timeless: [
      { content: "Become immortal" },
      { content: "Visit Mars" },
      { content: "Have long talk with Elon Musk" },
      { content: "Make friend with alien" },
      { content: "Create religion" },
      { content: "Create country" }
    ]
  };

  const togglePastItem = (id) => {
    setCompletedPastItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id) 
        : [...prev, id]
    );
  };

  return (
    <div className="dreams-page">
      <div className="dreams-grid">
        <div className="dream-column past-achievements">
          <h2>Past</h2>
          <div className="dream-list">
            {dreamsData.past.map((dream) => (
              <div 
                key={`past-${dream.id}`} 
                className={`dream-card ${completedPastItems.includes(dream.id) ? 'completed' : ''}`}
                onClick={() => togglePastItem(dream.id)}
              >
                <div className="dream-header">
                  <div className="dream-date">{dream.date}</div>
                  <span className="status-toggle">
                    {completedPastItems.includes(dream.id) ? '✓' : '✗'}
                  </span>
                </div>
                <div className="dream-content">
                  <p>{dream.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dream-column present-goals">
          <h2>Present</h2>
          <div className="dream-list">
            {dreamsData.present.map((dream, i) => (
              <div key={`present-${i}`} className="dream-card">
                <div className="dream-header">
                  <div className="dream-date">{dream.date}</div>
                </div>
                <div className="dream-content">
                  {dream.content.split('\n').map((line, j) => (
                    <p key={j}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dream-column future-plans">
          <h2>Future</h2>
          <div className="dream-list">
            {dreamsData.future.map((dream, i) => (
                <div key={`future-${i}`} className="dream-card">
                {dream.date && <div className="dream-date">{dream.date}</div>}
                <div className="dream-content">
                    {(dream.content || '').split('\n').map((line, j) => ( // Fallback to an empty string
                    <p key={j}>{line}</p>
                    ))}
                </div>
                </div>
            ))}
            </div>
        </div>

        <div className="dream-column timeless-dreams">
          <h2>Timeless Dreams</h2>
          <div className="dream-list">
            {dreamsData.timeless.map((dream, i) => (
              <div key={`timeless-${i}`} className="dream-card">
                <div className="dream-content">
                  <p>{dream.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dreams;