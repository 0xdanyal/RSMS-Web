// import React, { useState, useEffect } from 'react';

// export default function StaffAllocation({ housingEntries, staff, showPopup, societyId }) {
//   const [allocationForm, setAllocationForm] = useState({
//     address: '',
//     houseNumbers: [],
//     staffIds: []
//   });
//   const [formErrors, setFormErrors] = useState({});
//   const [allocations, setAllocations] = useState([]);
//   const [staffSearchQuery, setStaffSearchQuery] = useState('');

//   // Get unique addresses from housing entries
//   const uniqueAddresses = [...new Set(housingEntries.map(entry => entry.address))];

//   // Get house numbers for the selected address
//   const availableHouseNumbers = housingEntries
//     .filter(entry => entry.address === allocationForm.address)
//     .map(entry => entry.houseNumber);

//   // Filter staff based on search query
//   const filteredStaff = staff.filter(s =>
//     s.fullName.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
//     s.phoneNumber.toLowerCase().includes(staffSearchQuery.toLowerCase())
//   );

//   // Get selected staff roles
//   const selectedStaffRoles = staff
//     .filter(s => allocationForm.staffIds.includes(s._id))
//     .map(s => s.role)
//     .join(', ');

//   useEffect(() => {
//     // Fetch existing allocations
//     const fetchAllocations = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const response = await fetch(`http://localhost:5000/api/societies/${societyId}/allocations`, {
//           headers: { 'Authorization': `Bearer ${token}` }
//         });
//         if (!response.ok) {
//           throw new Error('Failed to fetch allocations');
//         }
//         const data = await response.json();
//         setAllocations(data);
//       } catch (error) {
//         showPopup(`Error fetching allocations: ${error.message}`, true);
//       }
//     };
//     fetchAllocations();
//   }, [societyId, showPopup]);

//   const validateForm = () => {
//     const errors = {};
//     if (!allocationForm.address) {
//       errors.address = 'Address is required';
//     }
//     if (allocationForm.houseNumbers.length === 0) {
//       errors.houseNumbers = 'At least one house number is required';
//     }
//     if (allocationForm.staffIds.length === 0) {
//       errors.staffIds = 'At least one staff member is required';
//     }
//     return errors;
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setAllocationForm(prev => ({ ...prev, [name]: value }));
//     setFormErrors(prev => ({ ...prev, [name]: '' }));
//   };

//   const handleMultiSelectChange = (e, field) => {
//     const options = Array.from(e.target.selectedOptions).map(option => option.value);
//     setAllocationForm(prev => ({ ...prev, [field]: options }));
//     setFormErrors(prev => ({ ...prev, [field]: '' }));
//   };

//   const handleStaffSearchChange = (e) => {
//     setStaffSearchQuery(e.target.value);
//   };

//   const handleClearStaffSearch = () => {
//     setStaffSearchQuery('');
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const errors = validateForm();

//     if (Object.keys(errors).length > 0) {
//       setFormErrors(errors);
//       showPopup('Please fix form errors', true);
//       return;
//     }

//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`http://localhost:5000/api/societies/${societyId}/allocations`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(allocationForm)
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         showPopup(errorData.message || 'Error creating allocation', true);
//         return;
//       }

//       const newAllocation = await response.json();
//       setAllocations([...allocations, newAllocation]);
//       setAllocationForm({ address: '', houseNumbers: [], staffIds: [] });
//       setStaffSearchQuery('');
//       setFormErrors({});
//       showPopup('✅ Staff allocation created successfully!', false);
//     } catch (error) {
//       showPopup(`Error creating allocation: ${error.message}`, true);
//     }
//   };

//   return (
//     <div className="staff-allocation">
//       <h2>Staff Allocation</h2>
//       <div className="form-container">
//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label htmlFor="address">Street/Address</label>
//             <select
//               id="address"
//               name="address"
//               value={allocationForm.address}
//               onChange={handleInputChange}
//             >
//               <option value="">Select an address</option>
//               {uniqueAddresses.map(address => (
//                 <option key={address} value={address}>{address}</option>
//               ))}
//             </select>
//             {formErrors.address && <span className="error">{formErrors.address}</span>}
//           </div>
//           <div className="form-group">
//             <label htmlFor="houseNumbers">House Numbers</label>
//             <select
//               id="houseNumbers"
//               name="houseNumbers"
//               multiple
//               value={allocationForm.houseNumbers}
//               onChange={(e) => handleMultiSelectChange(e, 'houseNumbers')}
//               disabled={!allocationForm.address}
//             >
//               {availableHouseNumbers.map(houseNumber => (
//                 <option key={houseNumber} value={houseNumber}>{houseNumber}</option>
//               ))}
//             </select>
//             {formErrors.houseNumbers && <span className="error">{formErrors.houseNumbers}</span>}
//             <small>Hold Ctrl (Windows) or Cmd (Mac) to select multiple house numbers</small>
//           </div>
//           <div className="form-group">
//             <label htmlFor="staffSearch">Search Staff</label>
//             <div className="search-container">
//               <input
//                 type="text"
//                 id="staffSearch"
//                 name="staffSearch"
//                 value={staffSearchQuery}
//                 onChange={handleStaffSearchChange}
//                 placeholder="Search by name or phone number"
//               />
//               {staffSearchQuery && (
//                 <button type="button" className="clear-button" onClick={handleClearStaffSearch}>
//                   Clear
//                 </button>
//               )}
//             </div>
//           </div>
//           <div className="form-group">
//             <label htmlFor="staffIds">Staff Members</label>
//             <select
//               id="staffIds"
//               name="staffIds"
//               multiple
//               value={allocationForm.staffIds}
//               onChange={(e) => handleMultiSelectChange(e, 'staffIds')}
//             >
//               {filteredStaff.map(s => (
//                 <option key={s._id} value={s._id}>{`${s.fullName} (${s.role})`}</option>
//               ))}
//             </select>
//             {formErrors.staffIds && <span className="error">{formErrors.staffIds}</span>}
//             <small>Hold Ctrl (Windows) or Cmd (Mac) to select multiple staff members</small>
//           </div>
//           <div className="form-group">
//             <label>Selected Roles</label>
//             <p>{selectedStaffRoles || 'No staff selected'}</p>
//           </div>
//           <button type="submit" className="submit-button">Allocate Staff</button>
//         </form>
//       </div>
//       <div className="allocation-list">
//         <h3>Existing Allocations</h3>
//         {allocations.length === 0 ? (
//           <p className="no-allocations">No allocations available.</p>
//         ) : (
//           <ul>
//             {allocations.map(allocation => (
//               <li key={allocation._id}>
//                 {allocation.address} (Houses: {allocation.houseNumbers.join(', ')}) - 
//                 Staff: {allocation.staffIds.map(id => {
//                   const s = staff.find(s => s._id === id);
//                   return s ? `${s.fullName} (${s.role})` : 'Unknown';
//                 }).join(', ')}
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';

export default function StaffAllocation({ housingEntries, staff, showPopup, societyId }) {
  const [allocationForm, setAllocationForm] = useState({
    address: '',
    houseNumbers: [],
    staffIds: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [allocations, setAllocations] = useState([]);
  const [staffSearchQuery, setStaffSearchQuery] = useState('');

  // Get unique addresses from housing entries
  const uniqueAddresses = [...new Set(housingEntries.map(entry => entry.address))];

  // Get house numbers for the selected address
  const availableHouseNumbers = housingEntries
    .filter(entry => entry.address === allocationForm.address)
    .map(entry => entry.houseNumber);

  // Filter staff based on search query
  const filteredStaff = staff.filter(s =>
    s.fullName.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
    s.phoneNumber.toLowerCase().includes(staffSearchQuery.toLowerCase())
  );

  // Get selected staff details (name and role)
  const selectedStaff = staff.filter(s => allocationForm.staffIds.includes(s._id));

  useEffect(() => {
    // Fetch existing allocations
    const fetchAllocations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/societies/${societyId}/allocations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch allocations');
        }
        const data = await response.json();
        setAllocations(data);
      } catch (error) {
        showPopup(`Error fetching allocations: ${error.message}`, true);
      }
    };
    fetchAllocations();
  }, [societyId, showPopup]);

  const validateForm = () => {
    const errors = {};
    if (!allocationForm.address) {
      errors.address = 'Address is required';
    }
    if (allocationForm.houseNumbers.length === 0) {
      errors.houseNumbers = 'At least one house number is required';
    }
    if (allocationForm.staffIds.length === 0) {
      errors.staffIds = 'At least one staff member is required';
    }
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAllocationForm(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleMultiSelectChange = (e, field) => {
    const options = Array.from(e.target.selectedOptions).map(option => option.value);
    setAllocationForm(prev => ({ ...prev, [field]: options }));
    setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleStaffSearchChange = (e) => {
    setStaffSearchQuery(e.target.value);
  };

  const handleClearStaffSearch = () => {
    setStaffSearchQuery('');
  };

  const handleDeselectStaff = (staffId) => {
    setAllocationForm(prev => ({
      ...prev,
      staffIds: prev.staffIds.filter(id => id !== staffId)
    }));
    setFormErrors(prev => ({ ...prev, staffIds: '' }));
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
      const response = await fetch(`http://localhost:5000/api/societies/${societyId}/allocations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(allocationForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        showPopup(errorData.message || 'Error creating allocation', true);
        return;
      }

      const newAllocation = await response.json();
      setAllocations([...allocations, newAllocation]);
      setAllocationForm({ address: '', houseNumbers: [], staffIds: [] });
      setStaffSearchQuery('');
      setFormErrors({});
      showPopup('✅ Staff allocation created successfully!', false);
    } catch (error) {
      showPopup(`Error creating allocation: ${error.message}`, true);
    }
  };

  return (
    <div className="staff-allocation">
      <h2>Staff Allocation</h2>
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="address">Street/Address</label>
            <select
              id="address"
              name="address"
              value={allocationForm.address}
              onChange={handleInputChange}
            >
              <option value="">Select an address</option>
              {uniqueAddresses.map(address => (
                <option key={address} value={address}>{address}</option>
              ))}
            </select>
            {formErrors.address && <span className="error">{formErrors.address}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="houseNumbers">House Numbers</label>
            <select
              id="houseNumbers"
              name="houseNumbers"
              multiple
              value={allocationForm.houseNumbers}
              onChange={(e) => handleMultiSelectChange(e, 'houseNumbers')}
              disabled={!allocationForm.address}
            >
              {availableHouseNumbers.map(houseNumber => (
                <option key={houseNumber} value={houseNumber}>{houseNumber}</option>
              ))}
            </select>
            {formErrors.houseNumbers && <span className="error">{formErrors.houseNumbers}</span>}
            <small>Hold Ctrl (Windows) or Cmd (Mac) to select multiple house numbers</small>
          </div>
          <div className="form-group">
            <label htmlFor="staffSearch">Search Staff</label>
            <div className="search-container">
              <input
                type="text"
                id="staffSearch"
                name="staffSearch"
                value={staffSearchQuery}
                onChange={handleStaffSearchChange}
                placeholder="Search by name or phone number"
              />
              {staffSearchQuery && (
                <button type="button" className="clear-button" onClick={handleClearStaffSearch}>
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="staffIds">Staff Members</label>
            <select
              id="staffIds"
              name="staffIds"
              multiple
              value={allocationForm.staffIds}
              onChange={(e) => handleMultiSelectChange(e, 'staffIds')}
            >
              {filteredStaff.map(s => (
                <option key={s._id} value={s._id}>{`${s.fullName} (${s.role})`}</option>
              ))}
            </select>
            {formErrors.staffIds && <span className="error">{formErrors.staffIds}</span>}
            <small>Hold Ctrl (Windows) or Cmd (Mac) to select multiple staff members</small>
          </div>
          <div className="form-group">
            <label>Selected Staff</label>
            <div className="selected-staff-container">
              {selectedStaff.length === 0 ? (
                <p>No staff selected</p>
              ) : (
                selectedStaff.map(s => (
                  <span key={s._id} className="selected-staff-label">
                    {`${s.fullName} (${s.role})`}
                    <span
                      className="deselect-icon"
                      onClick={() => handleDeselectStaff(s._id)}
                    >
                      ×
                    </span>
                  </span>
                ))
              )}
            </div>
          </div>
          <button type="submit" className="submit-button">Allocate Staff</button>
        </form>
      </div>
      <div className="allocation-list">
        <h3>Existing Allocations</h3>
        {allocations.length === 0 ? (
          <p className="no-allocations">No allocations available.</p>
        ) : (
          <ul>
            {allocations.map(allocation => (
              <li key={allocation._id}>
                {allocation.address} (Houses: {allocation.houseNumbers.join(', ')}) - 
                Staff: {allocation.staffIds.map(id => {
                  const s = staff.find(s => s._id === id);
                  return s ? `${s.fullName} (${s.role})` : 'Unknown';
                }).join(', ')}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}