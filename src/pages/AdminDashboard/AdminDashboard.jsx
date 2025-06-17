

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [societies, setSocieties] = useState([]);
  const [filteredSocieties, setFilteredSocieties] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    image: null,
    dateOfCreation: '',
    uniqueIdCode: '',
    managerName: '',
    managerEmail: '',
    managerPassword: ''
  });
  const [selectedOption, setSelectedOption] = useState('createSociety');
  const [selectedSociety, setSelectedSociety] = useState(null);
  const [societyStats, setSocietyStats] = useState(null);
  const [emailError, setEmailError] = useState('');
  const [imageError, setImageError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [showPopup, setShowPopup] = useState({ visible: false, message: '', isError: false });

  // Refs for progress circle canvases
  const residentCanvasRef = useRef(null);
  const staffCanvasRef = useRef(null);

  // Progress Circle drawing logic (integrated directly)
  const drawProgressCircle = (canvasRef, value, maxValue, color, size) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Set canvas size accounting for device pixel ratio
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size / 2) - 10;
    const lineWidth = 8;

    // Draw background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // Draw progress arc
    const normalizedValue = maxValue > 0 ? Math.min(100, Math.max(0, (value / maxValue) * 100)) / 100 : 0;
    const startAngle = -Math.PI / 2; // Start at top
    const endAngle = startAngle + (Math.PI * 2 * normalizedValue);

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  useEffect(() => {
    fetchSocieties();
  }, []);

  useEffect(() => {
    // Filter societies based on search query
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = societies.filter(
      (society) =>
        society.name.toLowerCase().includes(lowerQuery) ||
        society.uniqueIdCode.toLowerCase().includes(lowerQuery)
    );
    setFilteredSocieties(filtered);
  }, [searchQuery, societies]);

  useEffect(() => {
    // Auto-hide popup after 3 seconds
    if (showPopup.visible) {
      console.log('Popup triggered with message:', showPopup.message);
      const timer = setTimeout(() => {
        setShowPopup({ visible: false, message: '', isError: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showPopup.visible]);

  useEffect(() => {
    // Draw progress circles when societyStats is available
    if (societyStats && selectedOption === 'societyDetails') {
      // Calculate the maximum value between residents and staff for scaling
      const residentCount = societyStats.residentCount;
      const staffCount = societyStats.staffByRole.counts.reduce((sum, count) => sum + count, 0);
      const maxValue = Math.max(residentCount, staffCount, 1); // Avoid division by zero

      // Residents Progress Circle
      const residentPercentage = (residentCount / maxValue) * 100;
      drawProgressCircle(residentCanvasRef, residentCount, maxValue, '#1abc9c', 200);

      // Staff Progress Circle
      const staffPercentage = (staffCount / maxValue) * 100;
      drawProgressCircle(staffCanvasRef, staffCount, maxValue, '#3498db', 200);
    }
  }, [societyStats, selectedOption]);

  const fetchSocieties = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/societies', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        setShowPopup({ visible: true, message: `❌ Error: ${errorData.message}`, isError: true });
        return;
      }

      const data = await response.json();
      setSocieties(data);
      setFilteredSocieties(data);
    } catch (error) {
      setShowPopup({ visible: true, message: `❌ An error occurred while fetching societies: ${error.message}`, isError: true });
    }
  };

  const fetchSocietyStats = async (societyId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/societies/${societyId}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        setShowPopup({ visible: true, message: `❌ Error: ${errorData.message}`, isError: true });
        return;
      }

      const data = await response.json();
      setSocietyStats(data);
    } catch (error) {
      setShowPopup({ visible: true, message: `❌ An error occurred while fetching society stats: ${error.message}`, isError: true });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setImageError('Image size must not exceed 5MB');
        setShowPopup({ visible: true, message: `❌ ${imageError}`, isError: true });
        return;
      }

      if (!file.type.startsWith('image/')) {
        setImageError('Please upload a valid image file (e.g., JPG, PNG)');
        setShowPopup({ visible: true, message: `❌ ${imageError}`, isError: true });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          image: reader.result
        });
        setImageError('');
      };
      reader.onerror = () => {
        setImageError('Failed to read image file');
        setShowPopup({ visible: true, message: `❌ ${imageError}`, isError: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(formData.managerEmail)) {
      setEmailError('Please enter a valid email address.');
      setShowPopup({ visible: true, message: `❌ ${emailError}`, isError: true });
      return;
    }

    if (!formData.image) {
      setImageError('Please upload an image.');
      setShowPopup({ visible: true, message: `❌ ${imageError}`, isError: true });
      return;
    }

    if (!formData.description.trim()) {
      setDescriptionError('Please provide a description.');
      setShowPopup({ visible: true, message: `❌ ${descriptionError}`, isError: true });
      return;
    }

    if (!formData.dateOfCreation) {
      setDescriptionError('Please select a creation date.');
      setShowPopup({ visible: true, message: `❌ ${descriptionError}`, isError: true });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/societies/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const responseData = await response.json();

      if (response.ok) {
        setFormData({
          name: '',
          address: '',
          description: '',
          image: null,
          dateOfCreation: '',
          uniqueIdCode: '',
          managerName: '',
          managerEmail: '',
          managerPassword: ''
        });
        document.querySelector('input[type="file"]').value = '';
        fetchSocieties();
        setShowPopup({ visible: true, message: '✅ Society and manager created successfully!', isError: false });
      } else {
        setShowPopup({ visible: true, message: `❌ Error: `, isError: true });
      }
    } catch {
      setShowPopup({ visible: true, message: `❌ An unexpected error occurred: File is too big `, isError: true });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if (name === 'managerEmail' || name === 'managerPassword') {
      updatedValue = value.replace(/\s+/g, '');
    }

    if (name === 'description' && value.length > 150) {
      updatedValue = value.slice(0, 150);
    }

    setFormData({
      ...formData,
      [name]: updatedValue
    });

    if (name === 'managerEmail') {
      if (!validateEmail(updatedValue)) {
        setEmailError('Please enter a valid email address.');
      } else {
        setEmailError('');
      }
    }

    if (name === 'description' || name === 'dateOfCreation') {
      setDescriptionError('');
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSocietyClick = (society) => {
    setSelectedSociety(society);
    fetchSocietyStats(society._id);
    setSelectedOption('societyDetails');
  };

  // const handleBackToSocieties = () => {
  //   setSelectedSociety(null);
  //   setSocietyStats(null);
  //   setSelectedOption('viewSocieties');
  // };

  return (
    <div className="manager-dashboard">
      <div className="sidebar">
        <h1>Admin Panel</h1>
        <div className="sidebar-options">
          <button
            className={`sidebar-button ${selectedOption === 'createSociety' ? 'active' : ''}`}
            onClick={() => setSelectedOption('createSociety')}
          >
            🏢 Create Society
          </button>
          <button
            className={`sidebar-button ${selectedOption === 'viewSocieties' || selectedOption === 'societyDetails' ? 'active' : ''}`}
            onClick={() => setSelectedOption('viewSocieties')}
          >
            🏘️ View Societies
          </button>
        </div>
      </div>

      <div className="main-content">
        {selectedOption === 'createSociety' && (
          <section className="form-container">
            <h2>Create New Society</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Society Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description (max 150 characters)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  maxLength={150}
                />
                <p>{formData.description.length}/150 characters</p>
                {descriptionError && <p className="error">{descriptionError}</p>}
              </div>
              <div className="form-group">
                <label>Society Image (max 3MB, JPG/PNG)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleImageChange}
                  required
                />
                {imageError && <p className="error">{imageError}</p>}
              </div>
              <div className="form-group">
                <label>Date of Creation</label>
                <input
                  type="date"
                  name="dateOfCreation"
                  value={formData.dateOfCreation}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Custom Unique Identification Code</label>
                <input
                  type="text"
                  name="uniqueIdCode"
                  value={formData.uniqueIdCode}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Manager Name</label>
                <input
                  type="text"
                  name="managerName"
                  value={formData.managerName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Manager Email</label>
                <input
                  type="email"
                  name="managerEmail"
                  value={formData.managerEmail}
                  onChange={handleChange}
                  required
                />
                {emailError && <p className="error">{emailError}</p>}
              </div>
              <div className="form-group">
                <label>Manager Password</label>
                <input
                  type="password"
                  name="managerPassword"
                  value={formData.managerPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="submit-button">Create Society</button>
            </form>
          </section>
        )}

        {selectedOption === 'viewSocieties' && (
          <section className="societies-list">
            <h2>Existing Societies</h2>
            <div className="filter-container">
              <label htmlFor="society-filter">Filter by Name or Unique ID:</label>
              <input
                id="society-filter"
                type="text"
                className="filter-input"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Enter name or unique ID"
              />
            </div>
            <div className="societies-grid">
              {filteredSocieties.map((society) => (
                <div
                  key={society._id}
                  className="society-card"
                  onClick={() => handleSocietyClick(society)}
                >
                  {society.image ? (
                    <img
                      src={society.image}
                      alt={society.name}
                      className="society-image"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23ccc"/%3E%3Ctext x="50" y="50" font-size="20" text-anchor="middle" fill="%23fff"%3EImage Error%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <div className="society-image-placeholder">
                      No Image Available
                    </div>
                  )}
                  <h3>{society.name}</h3>
                  <p><strong>Address:</strong> {society.address}</p>
                  <p className="description"><strong>Description:</strong> {society.description || 'No description available'}</p>
                  <p><strong>Manager:</strong> {society.managerName} ({society.managerEmail})</p>
                  <p><strong>Unique ID:</strong> {society.uniqueIdCode}</p>
                  <p><strong>Created:</strong> {new Date(society.dateOfCreation).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {selectedOption === 'societyDetails' && selectedSociety && (
          <section className="society-details">
            {/* <button className="back-button" onClick={handleBackToSocieties}>⬅ Back to Societies</button> */}
            <div className="society-header">
              {selectedSociety.image ? (
                <div className="image-wrapper">
                  <img
                    src={selectedSociety.image}
                    alt={selectedSociety.name}
                    className="society-detail-image"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23ccc"/%3E%3Ctext x="50" y="50" font-size="20" text-anchor="middle" fill="%23fff"%3EImage Error%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <div className="image-overlay">
                    <h2>{selectedSociety.name}</h2>
                  </div>
                </div>
              ) : (
                <div className="society-image-placeholder large">
                  No Image Available
                </div>
              )}
            </div>
            <div className="society-info">
              <p><strong>Address:</strong> {selectedSociety.address}</p>
              <p><strong>Description:</strong> {selectedSociety.description || 'No description available'}</p>
              <p><strong>Manager:</strong> {selectedSociety.managerName} ({selectedSociety.managerEmail})</p>
              <p><strong>Unique ID:</strong> {selectedSociety.uniqueIdCode}</p>
              <p><strong>Created:</strong> {new Date(selectedSociety.dateOfCreation).toLocaleDateString()}</p>
            </div>

            {societyStats ? (
              <div className="charts-container">
                <div className="chart">
                  <div className="progress-circle-container" style={{ width: '150px' }}>
                    <canvas
                      ref={residentCanvasRef}
                      className="progress-circle"
                      style={{ width: '150px', height: '150px' }}
                    />
                    <div className="progress-value" style={{ color: '#1abc9c' }}>
                      {societyStats.residentCount}
                    </div>
                    <h3 className="progress-title">Residents</h3>
                    <p className="progress-subtitle">Total: {societyStats.residentCount}</p>
                  </div>
                </div>
                <div className="chart">
                  <div className="progress-circle-container" style={{ width: '150px' }}>
                    <canvas
                      ref={staffCanvasRef}
                      className="progress-circle"
                      style={{ width: '150px', height: '150px' }}
                    />
                    <div className="progress-value" style={{ color: '#3498db' }}>
                      {societyStats.staffByRole.counts.reduce((sum, count) => sum + count, 0)}
                    </div>
                    <h3 className="progress-title">Staff</h3>
                    <p className="progress-subtitle">
                      Total: {societyStats.staffByRole.counts.reduce((sum, count) => sum + count, 0)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="loading">Loading stats...</div>
            )}
          </section>
        )}
      </div>

      {showPopup.visible && (
        <div className={`popup ${showPopup.isError ? 'error' : 'success'}`}>
          <p>{showPopup.message}</p>
        </div>
      )}
    </div>
  );
}
