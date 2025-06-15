import React, { useState } from 'react';

export default function HousingEntry({ housingEntries, setHousingEntries, showPopup, societyId }) {
  const [housingForm, setHousingForm] = useState({
    address: '',
    houseNumber: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const validateForm = () => {
    const errors = {};
    if (!housingForm.address) {
      errors.address = 'Address is required';
    } else if (housingForm.address.length < 5) {
      errors.address = 'Address must be at least 5 characters';
    }
    if (!housingForm.houseNumber) {
      errors.houseNumber = 'House number is required';
    } else if (!/^\d+[A-Za-z]?$/.test(housingForm.houseNumber)) {
      errors.houseNumber = 'House number must be numeric with optional single letter suffix';
    }
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHousingForm(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showPopup('Please fix form errors', true);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/societies/${societyId}/housing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(housingForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        showPopup(errorData.message || 'Error creating housing entry', true);
        return;
      }

      const newHousingEntry = await response.json();
      console.log('New Housing Entry:', newHousingEntry); // Debug: Log the API response
      setHousingEntries([...housingEntries, newHousingEntry]);
      setHousingForm({ address: '', houseNumber: '' });
      setFormErrors({});
      showPopup('✅ Housing entry created successfully!', false);
    } catch (error) {
      console.error('Error creating housing entry:', error);
      showPopup(`Error creating housing entry: ${error.message}`, true);
    }
  };

  // Debug: Log housingEntries to verify data structure
  console.log('Housing Entries:', housingEntries);

  // Filter housing entries based on search query
  const filteredEntries = housingEntries.filter(entry => {
    const address = entry.address || '';
    const houseNumber = entry.houseNumber || '';
    return (
      address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      houseNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="housing-entry">
      <h2>Housing Entry</h2>
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={housingForm.address}
              onChange={handleInputChange}
              placeholder="Enter address"
            />
            {formErrors.address && <span className="error">{formErrors.address}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="houseNumber">House Number</label>
            <input
              type="text"
              id="houseNumber"
              name="houseNumber"
              value={housingForm.houseNumber}
              onChange={handleInputChange}
              placeholder="Enter house number (e.g., 123 or 123A)"
            />
            {formErrors.houseNumber && <span className="error">{formErrors.houseNumber}</span>}
          </div>
          <button type="submit" className="submit-button">Add Housing Entry</button>
        </form>
      </div>
      <div className="housing-list">
        <h3>Existing Housing Entries</h3>
        <div className="form-container">
          <div className="form-group">
            <label htmlFor="search">Search Housing Entries</label>
            <div className="search-container">
              <input
                type="text"
                id="search"
                name="search"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by address or house number"
              />
              {searchQuery && (
                <button className="clear-button" onClick={handleClearSearch}>
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
        {filteredEntries.length === 0 ? (
          <p className="no-housing">
            {searchQuery ? 'No housing entries match your search.' : 'No housing entries available.'}
          </p>
        ) : (
          <ul>
            {filteredEntries.map(entry => (
              <li key={entry._id}>
                {entry.address} - {entry.houseNumber}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}