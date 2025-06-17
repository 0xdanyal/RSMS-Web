


import React from 'react';
import PropTypes from 'prop-types';

export default function EditStaffModal({
  staffForm,
  formErrors,
  handleEditSubmit,
  handleStaffInputChange,
  setEditStaff,
  setStaffForm,
  setFormErrors
}) {
  const onSubmit = (e) => {
    e.preventDefault();
    // Explicitly send only the editable fields
    const updatedStaff = {
      fullName: staffForm.fullName,
      phoneNumber: staffForm.phoneNumber,
      password: staffForm.password,
      role: staffForm.role
    };
    handleEditSubmit(updatedStaff);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Edit Staff</h2>
        <form className="staff-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="editFullName">Full Name</label>
            <input
              type="text"
              id="editFullName"
              name="fullName"
              value={staffForm.fullName}
              onChange={handleStaffInputChange}
              required
            />
            {formErrors.fullName && <span className="error">{formErrors.fullName}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="editPhoneNumber">Phone Number</label>
            <input
              type="tel"
              id="editPhoneNumber"
              name="phoneNumber"
              value={staffForm.phoneNumber}
              onChange={handleStaffInputChange}
              required
              maxLength="11"
            />
            {formErrors.phoneNumber && <span className="error">{formErrors.phoneNumber}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="editPassword">Password (leave blank to keep unchanged)</label>
            <input
              type="password"
              id="editPassword"
              name="password"
              value={staffForm.password}
              onChange={handleStaffInputChange}
            />
            {formErrors.password && <span className="error">{formErrors.password}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="editRole">Role</label>
            <select
              id="editRole"
              name="role"
              value={staffForm.role}
              onChange={handleStaffInputChange}
              required
            >
              <option value="">Select Role</option>
              <option value="Cleaner">Cleaner</option>
              <option value="Gardener">Gardener</option>
              <option value="Event Manager">Event Manager</option>
              <option value="Security">Security</option>
              <option value="Maintenance">Maintenance</option>
            </select>
            {formErrors.role && <span className="error">{formErrors.role}</span>}
          </div>
          <button type="submit" className="submit-button">Update Staff</button>
          <button
            type="button"
            className="cancel-button"
            onClick={() => {
              setEditStaff(null);
              setStaffForm({ fullName: '', phoneNumber: '', password: '', role: '' });
              setFormErrors({});
            }}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

EditStaffModal.propTypes = {
  staffForm: PropTypes.shape({
    fullName: PropTypes.string.isRequired,
    phoneNumber: PropTypes.string.isRequired,
    password: PropTypes.string,
    role: PropTypes.string.isRequired,
  }).isRequired,
  formErrors: PropTypes.shape({
    fullName: PropTypes.string,
    phoneNumber: PropTypes.string,
    password: PropTypes.string,
    role: PropTypes.string,
  }).isRequired,
  handleEditSubmit: PropTypes.func.isRequired,
  handleStaffInputChange: PropTypes.func.isRequired,
  setEditStaff: PropTypes.func.isRequired,
  setStaffForm: PropTypes.func.isRequired,
  setFormErrors: PropTypes.func.isRequired,
};