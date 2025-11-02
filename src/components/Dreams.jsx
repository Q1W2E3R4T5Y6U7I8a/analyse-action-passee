import React, { useState, useEffect, useRef } from 'react';
import { Draggable, Droppable, DragDropContext } from 'react-beautiful-dnd';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Dreams.scss';

// Fix for default markers in leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Dreams = () => {
  // State management
  const [dreams, setDreams] = useState(() => {
    const savedDreams = localStorage.getItem('dreams');
    return savedDreams ? JSON.parse(savedDreams) : {
      past: [],
      present: [],
      future: [],
      timeless: []
    };
  });
  
  const [markers, setMarkers] = useState(() => {
    const savedMarkers = localStorage.getItem('dreamMarkers');
    return savedMarkers ? JSON.parse(savedMarkers) : [];
  });
  
  const [activeTab, setActiveTab] = useState('dreams');
  const [newDream, setNewDream] = useState({ content: '', date: '', category: 'art', column: 'present' });
  const [newMarker, setNewMarker] = useState({ content: '', status: 'future', category: 'art' });
  const [editingDream, setEditingDream] = useState(null);
  const [editingMarker, setEditingMarker] = useState(null);
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]);
  const [filterCategory, setFilterCategory] = useState('all');
  const mapRef = useRef(null);

  // Function to parse date and get sortable value
  const parseDateForSorting = (dateString) => {
    if (!dateString || !dateString.trim()) return { sortValue: Infinity, original: dateString };
    
    const cleanDate = dateString.trim();
    
    // Check for "YYYY" format
    if (/^\d{4}$/.test(cleanDate)) {
      return { 
        sortValue: parseInt(cleanDate), 
        original: dateString,
        isValidFormat: true
      };
    }
    
    // Check for "YYYY Month" format
    const monthMatch = cleanDate.match(/^(\d{4})\s+([a-zA-Z]+)$/);
    if (monthMatch) {
      const year = parseInt(monthMatch[1]);
      const monthName = monthMatch[2].toLowerCase();
      const months = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
      ];
      const monthIndex = months.indexOf(monthName);
      if (monthIndex !== -1) {
        return { 
          sortValue: year + (monthIndex + 1) / 12,
          original: dateString,
          isValidFormat: true
        };
      }
    }
    
    // Invalid format - push to bottom
    return { 
      sortValue: Infinity, 
      original: dateString,
      isValidFormat: false
    };
  };

  // Function to sort dreams by date
  const sortDreamsByDate = (dreamList, column) => {
    if (column === 'timeless' || column === 'past') {
      return dreamList;
    }
    
    return [...dreamList].sort((a, b) => {
      const dateA = parseDateForSorting(a.date);
      const dateB = parseDateForSorting(b.date);
      
      // Both have valid format dates
      if (dateA.isValidFormat && dateB.isValidFormat) {
        return dateA.sortValue - dateB.sortValue;
      }
      
      // Only A has valid format
      if (dateA.isValidFormat && !dateB.isValidFormat) {
        return -1;
      }
      
      // Only B has valid format
      if (!dateA.isValidFormat && dateB.isValidFormat) {
        return 1;
      }
      
      // Neither has valid format - keep original order
      return 0;
    });
  };

  const exportToJson = () => {
    const data = { dreams, markers };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dreams_data.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importFromJson = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.dreams && data.markers) {
          setDreams(data.dreams);
          setMarkers(data.markers);
        } else {
          alert('Invalid JSON format');
        }
      } catch (error) {
        alert('Error parsing JSON');
      }
    };
    reader.readAsText(file);
  };

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('dreams', JSON.stringify(dreams));
    localStorage.setItem('dreamMarkers', JSON.stringify(markers));
  }, [dreams, markers]);

  // Dream CRUD operations
  const addDream = () => {
    if (!newDream.content.trim()) return;
    
    const dream = {
      id: Date.now(),
      content: newDream.content,
      date: newDream.date,
      category: newDream.category,
    };
    
    setDreams(prev => ({
      ...prev,
      [newDream.column]: [...prev[newDream.column], dream]
    }));
    
    setNewDream({ content: '', date: '', category: 'art', column: 'present' });
  };

  const updateDream = () => {
    if (!editingDream) return;
    
    setDreams(prev => {
      const updatedDreams = { ...prev };
      Object.keys(updatedDreams).forEach(column => {
        updatedDreams[column] = updatedDreams[column].map(dream => 
          dream.id === editingDream.id ? editingDream : dream
        );
      });
      return updatedDreams;
    });
    
    setEditingDream(null);
  };

  const deleteDream = (id) => {
    setDreams(prev => {
      const updatedDreams = { ...prev };
      Object.keys(updatedDreams).forEach(column => {
        updatedDreams[column] = updatedDreams[column].filter(dream => dream.id !== id);
      });
      return updatedDreams;
    });
  };

  // Marker CRUD operations
  const addMarker = (e) => {
    if (!newMarker.content.trim()) return;
    
    const marker = {
      id: Date.now(),
      content: newMarker.content,
      lat: e.latlng.lat,
      lng: e.latlng.lng,
      status: newMarker.status,
      category: newMarker.category
    };
    
    setMarkers(prev => [...prev, marker]);
    setNewMarker({ content: '', status: 'future', category: 'art' });
  };

  const updateMarker = () => {
    if (!editingMarker) return;
    
    setMarkers(prev => 
      prev.map(marker => marker.id === editingMarker.id ? editingMarker : marker)
    );
    
    setEditingMarker(null);
  };

  const deleteMarker = (id) => {
    setMarkers(prev => prev.filter(marker => marker.id !== id));
  };

  // Drag and drop handlers
  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const sourceCol = result.source.droppableId;
    const destCol = result.destination.droppableId;
    
    const sourceDreams = [...dreams[sourceCol]];
    const destDreams = [...dreams[destCol]];
    const [movedDream] = sourceDreams.splice(result.source.index, 1);
    
    // When moving to past, add completed property
    if (destCol === 'past') {
      movedDream.completed = false;
    } else if (movedDream.completed) {
      // Remove completed property if moving out of past
      delete movedDream.completed;
    }
    
    destDreams.splice(result.destination.index, 0, movedDream);
    
    setDreams(prev => ({
      ...prev,
      [sourceCol]: sourceDreams,
      [destCol]: destDreams
    }));
  };

  // Map event handlers
  const handleMapClick = (e) => {
    if (activeTab === 'map' && newMarker.content) {
      addMarker(e);
    }
  };

  const toggleDreamCompletion = (id) => {
    setDreams(prev => {
      const updatedDreams = { ...prev };
      updatedDreams.past = updatedDreams.past.map(dream => 
        dream.id === id ? { ...dream, completed: !dream.completed } : dream
      );
      return updatedDreams;
    });
  };

  // Filter dreams by category
  const filterDreams = (dreamList) => {
    if (filterCategory === 'all') return dreamList;
    return dreamList.filter(dream => dream.category === filterCategory);
  };

  // Category icons
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'freedom': return '🕊️';
      case 'love': return '❤️';
      case 'art': return '🎨';
      default: return '🌍';
    }
  };

  // Marker icons
  const getMarkerIcon = (status) => {
    const iconUrl = status === 'completed' 
      ? 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-green.png'
      : status === 'present'
        ? 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-gold.png'
        : 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-red.png';
    
    return L.icon({
      iconUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34]
    });
  };

  return (
    <div className="dreams-app">
      <header className="app-header">
        <h1>Dream Tracker</h1>
        <div className="pillars">
          <div className="pillar freedom">🕊️ Freedom</div>
          <div className="pillar love">❤️ Love</div>
          <div className="pillar art">🎨 Art</div>
        </div>
      </header>

      <div className="tab-navigation">
        <button 
          className={activeTab === 'dreams' ? 'active' : ''}
          onClick={() => setActiveTab('dreams')}
        >
          Dream Board
        </button>
        <button 
          className={activeTab === 'map' ? 'active' : ''}
          onClick={() => setActiveTab('map')}
        >
          Dream Map
        </button>
      </div>

      <div className="import-export">
        <button onClick={exportToJson}>Export to JSON</button>
        <label className="import-btn">
          Import from JSON
          <input 
            type="file" 
            accept="application/json" 
            onChange={importFromJson} 
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {activeTab === 'dreams' ? (
        <div className="dream-board">
          <div className="app-controls">
            <div className="category-filter">
              <label>Filter by Category:</label>
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="freedom">Freedom</option>
                <option value="love">Love</option>
                <option value="art">Art</option>
              </select>
            </div>
          </div>

          <div className="dream-form">
            <h3>Add New Dream</h3>
            <input
              type="text"
              placeholder="Dream content"
              value={newDream.content}
              onChange={(e) => setNewDream({...newDream, content: e.target.value})}
            />
            <input
              type="text"
              placeholder="Date (e.g., '2025' or '2025 April')"
              value={newDream.date}
              onChange={(e) => setNewDream({...newDream, date: e.target.value})}
            />
            <select
              value={newDream.category}
              onChange={(e) => setNewDream({...newDream, category: e.target.value})}
            >
              <option value="freedom">Freedom</option>
              <option value="love">Love</option>
              <option value="art">Art</option>
            </select>
            <select
              value={newDream.column}
              onChange={(e) => setNewDream({...newDream, column: e.target.value})}
            >
              <option value="past">Past</option>
              <option value="present">Present</option>
              <option value="future">Future</option>
              <option value="timeless">Timeless</option>
            </select>
            <button onClick={addDream}>Add Dream</button>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <div className="dreams-grid">
              {['past', 'present', 'future', 'timeless'].map((column) => (
                <div key={column} className="dream-column">
                  <h2>
                    {column.charAt(0).toUpperCase() + column.slice(1)}
                    {column === 'past' && ' (drag here when completed)'}
                  </h2>
                  <Droppable droppableId={column}>
                    {(provided) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="dream-list"
                      >
                        {sortDreamsByDate(filterDreams(dreams[column]), column).map((dream, index) => (
                          <Draggable key={dream.id} draggableId={dream.id.toString()} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`dream-card ${dream.category} ${
                                  column === 'past' && dream.completed ? 'completed' : ''
                                }`}
                              >
                                <div className="dream-header">
                                  <span className="dream-category">
                                    {getCategoryIcon(dream.category)}
                                  </span>
                                  <span className="dream-date">{dream.date}</span>
                                  {column === 'past' && (
                                    <button 
                                      className={`completion-toggle ${dream.completed ? 'completed' : ''}`}
                                      onClick={() => toggleDreamCompletion(dream.id)}
                                    >
                                      {dream.completed ? '✓' : '✗'}
                                    </button>
                                  )}
                                  <div className="dream-actions">
                                    <button onClick={() => setEditingDream(dream)}>✏️</button>
                                    <button onClick={() => deleteDream(dream.id)}>🗑️</button>
                                  </div>
                                </div>
                                <div className="dream-content">
                                  <p>{dream.content}</p>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        </div>
      ) : (
        <div className="dream-map-container">
          <div className="map-controls">
            <div className="marker-form">
              <h3>Add Map Marker</h3>
              <input
                type="text"
                placeholder="Dream location description"
                value={newMarker.content}
                onChange={(e) => setNewMarker({...newMarker, content: e.target.value})}
              />
              <select
                value={newMarker.status}
                onChange={(e) => setNewMarker({...newMarker, status: e.target.value})}
              >
                <option value="future">Future (Red)</option>
                <option value="present">In Progress (Yellow)</option>
                <option value="completed">Completed (Green)</option>
              </select>
              <select
                value={newMarker.category}
                onChange={(e) => setNewMarker({...newMarker, category: e.target.value})}
              >
                <option value="freedom">Freedom</option>
                <option value="love">Love</option>
                <option value="art">Art</option>
              </select>
              <p className="hint">Manualy change the json file in text to make the dots / descriptions, the noraml adding doest work right now</p>
            </div>

            <div className="marker-list">
              <h3>Your Dream Locations</h3>
              <div className="marker-items">
                {markers.map(marker => (
                  <div key={marker.id} className="marker-item" onClick={() => {
                    setEditingMarker(marker);
                    setMapCenter([marker.lat, marker.lng]);
                    if (mapRef.current) {
                      mapRef.current.flyTo([marker.lat, marker.lng], 8);
                    }
                  }}>
                    <div className="marker-status" style={{
                      backgroundColor: marker.status === 'completed' ? 'green' : 
                                    marker.status === 'present' ? 'gold' : 'red'
                    }}></div>
                    <div className="marker-content">
                      <strong>{marker.content}</strong>
                      <small>{marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}</small>
                      <span className="marker-category">{getCategoryIcon(marker.category)}</span>
                    </div>
                    <button 
                      className="delete-marker"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMarker(marker.id);
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <MapContainer 
            center={mapCenter} 
            zoom={3} 
            style={{ height: '70vh', width: '100%' }}
            ref={mapRef}
            onClick={handleMapClick}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {markers.map(marker => (
              <Marker 
                key={marker.id} 
                position={[marker.lat, marker.lng]} 
                icon={getMarkerIcon(marker.status)}
                eventHandlers={{
                  click: () => {
                    setEditingMarker(marker);
                    setMapCenter([marker.lat, marker.lng]);
                  }
                }}
              >
                <Popup>
                  <div className="marker-popup">
                    <h4>{marker.content}</h4>
                    <p>Status: {marker.status}</p>
                    <p>Category: {marker.category} {getCategoryIcon(marker.category)}</p>
                    <button onClick={() => {
                      setEditingMarker(marker);
                    }}>Edit</button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {/* Edit Dream Modal */}
      {editingDream && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Dream</h3>
            <input
              type="text"
              value={editingDream.content}
              onChange={(e) => setEditingDream({...editingDream, content: e.target.value})}
            />
            <input
              type="text"
              value={editingDream.date || ''}
              onChange={(e) => setEditingDream({...editingDream, date: e.target.value})}
              placeholder="Date (e.g., '2025' or '2025 April')"
            />
            <select
              value={editingDream.category}
              onChange={(e) => setEditingDream({...editingDream, category: e.target.value})}
            >
              <option value="freedom">Freedom</option>
              <option value="love">Love</option>
              <option value="art">Art</option>
            </select>
            <div className="modal-actions">
              <button onClick={updateDream}>Save</button>
              <button onClick={() => setEditingDream(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Marker Modal */}
      {editingMarker && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Location Dream</h3>
            <input
              type="text"
              value={editingMarker.content}
              onChange={(e) => setEditingMarker({...editingMarker, content: e.target.value})}
            />
            <select
              value={editingMarker.status}
              onChange={(e) => setEditingMarker({...editingMarker, status: e.target.value})}
            >
              <option value="future">Future (Red)</option>
              <option value="present">In Progress (Yellow)</option>
              <option value="completed">Completed (Green)</option>
            </select>
            <select
              value={editingMarker.category}
              onChange={(e) => setEditingMarker({...editingMarker, category: e.target.value})}
            >
              <option value="freedom">Freedom</option>
              <option value="love">Love</option>
              <option value="art">Art</option>
            </select>
            <div className="modal-actions">
              <button onClick={updateMarker}>Save</button>
              <button onClick={() => setEditingMarker(null)}>Cancel</button>
              <button className="delete" onClick={() => {
                deleteMarker(editingMarker.id);
                setEditingMarker(null);
              }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dreams;