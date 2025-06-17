



import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManagerDashboard.css';
import Sidebar from './Sidebar';
import ResidentRequests from './ResidentRequests';
import StaffManagement from './StaffManagement';
import Issues from './Issues';
import EditStaffModal from './EditStaffModal';
import Popup from './Popup';
import Announcement from './Announcement';
import HousingEntry from './HousingEntry';
import StaffAllocation from './StaffAllocation';
import MarketplaceListings from './MarketplaceListings';
import ManagerChat from './ManagerChat';

// Helper function to decode JWT
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Token decode error:', err.message);
    return null;
  }
};

export default function ManagerDashboard() {
  const [society, setSociety] = useState(null);
  const [requests, setRequests] = useState([]);
  const [staff, setStaff] = useState([]);
  const [residents, setResidents] = useState([]);
  const [openIssues, setOpenIssues] = useState([]);
  const [underReviewIssues, setUnderReviewIssues] = useState([]);
  const [resolvedIssues, setResolvedIssues] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [housingEntries, setHousingEntries] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [listings, setListings] = useState([]);
  const [selectedOption, setSelectedOption] = useState('requests');
  const [showPopup, setShowPopup] = useState({ visible: false, message: '', isError: false });
  const [staffForm, setStaffForm] = useState({
    fullName: '',
    phoneNumber: '',
    password: '',
    role: '',
    startDate: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [editStaff, setEditStaff] = useState(null);
  const navigate = useNavigate();

  // Memoize setListings and showPopup to prevent useEffect loops
  const memoizedSetListings = useCallback((listings) => {
    setListings(listings);
  }, []);

  const memoizedShowPopup = useCallback((message, isError) => {
    setShowPopup({ visible: true, message, isError });
    setTimeout(() => setShowPopup({ visible: false, message: '', isError: false }), 3000);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const societyId = localStorage.getItem('societyId');

        console.log('Fetching data with societyId:', societyId, 'token:', token);

        if (!token || !societyId) {
          setShowPopup({ visible: true, message: 'Missing token or society ID', isError: true });
          setTimeout(() => {
            setShowPopup({ visible: false, message: '', isError: false });
            navigate('/login');
          }, 3000);
          return;
        }

        // Decode token to get userId
        const decodedToken = decodeToken(token);
        if (!decodedToken || !decodedToken.userId) {
          setShowPopup({ visible: true, message: 'Invalid token', isError: true });
          setTimeout(() => {
            setShowPopup({ visible: false, message: '', isError: false });
            navigate('/login');
          }, 3000);
          return;
        }

        // Fetch society details
        const societyResponse = await fetch(`http://localhost:5000/api/societies/${societyId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!societyResponse.ok) {
          const societyErrorData = await societyResponse.json();
          setShowPopup({ visible: true, message: societyErrorData.message || 'Error fetching society data', isError: true });
          setTimeout(() => setShowPopup({ visible: false, message: '', isError: false }), 3000);
          return;
        }

        const societyData = await societyResponse.json();
        setSociety(societyData);
        setRequests(societyData.residentRequests.filter(req => req.status === 'Pending'));

        // Fetch staff members
        const staffResponse = await fetch(`http://localhost:5000/api/societies/staffcreation/${societyId}/staff`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!staffResponse.ok) {
          const staffErrorData = await staffResponse.json();
          setShowPopup({ visible: true, message: staffErrorData.message || 'Error fetching staff', isError: true });
          setTimeout(() => setShowPopup({ visible: false, message: '', isError: false }), 3000);
          return;
        }

        const staffData = await staffResponse.json();
        setStaff(staffData);

        // Fetch residents
        // try {
        //   const response = await fetch(`http://localhost:5000/api/societies/residents?society=${societyId}`, {
        //     headers: {
        //       Authorization: `Bearer ${token}`,
        //       'Content-Type': 'application/json'
        //     }
        //   });

        //   const data = await response.json();

        //   if (!response.ok) {
        //     console.error('Residents fetch failed:', data);
        //     setShowPopup({ visible: true, message: data.message || 'Error fetching residents', isError: true });
        //   } else {
        //     console.log('✅ Residents fetched:', data);
        //     setResidents(data);
        //   }
        // } catch (error) {
        //   console.error('🛑 Fetch error:', error);
        //   setShowPopup({ visible: true, message: 'Network/Server Error fetching residents', isError: true });
        // }

        // Fetch issues
        const [openIssuesResponse, underReviewIssuesResponse, resolvedIssuesResponse] = await Promise.all([
          fetch(`http://localhost:5000/api/issues/${societyId}?status=Open`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`http://localhost:5000/api/issues/${societyId}?status=Under Review`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`http://localhost:5000/api/issues/${societyId}?status=Resolved`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (!openIssuesResponse.ok || !underReviewIssuesResponse.ok || !resolvedIssuesResponse.ok) {
          const errorData = await Promise.any([
            openIssuesResponse.json().catch(() => ({})),
            underReviewIssuesResponse.json().catch(() => ({})),
            resolvedIssuesResponse.json().catch(() => ({}))
          ]);
          setShowPopup({ visible: true, message: errorData.message || 'Error fetching issues', isError: true });
          setTimeout(() => setShowPopup({ visible: false, message: '', isError: false }), 3000);
          return;
        }

        const openIssuesData = await openIssuesResponse.json();
        const underReviewIssuesData = await underReviewIssuesResponse.json();
        const resolvedIssuesData = await resolvedIssuesResponse.json();

        setOpenIssues(openIssuesData);
        setUnderReviewIssues(underReviewIssuesData);
        setResolvedIssues(resolvedIssuesData);

        // Fetch announcements
        const announcementsResponse = await fetch(`http://localhost:5000/api/${societyId}/announcements`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!announcementsResponse.ok) {
          const announcementsErrorData = await announcementsResponse.json();
          setShowPopup({ visible: true, message: announcementsErrorData.message || 'Error fetching announcements', isError: true });
          setTimeout(() => setShowPopup({ visible: false, message: '', isError: false }), 3000);
          return;
        }

        const announcementsData = await announcementsResponse.json();
        setAnnouncements(announcementsData);

        // Fetch housing entries
        const housingResponse = await fetch(`http://localhost:5000/api/societies/${societyId}/housing`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!housingResponse.ok) {
          const housingErrorData = await housingResponse.json();
          setShowPopup({ visible: true, message: housingErrorData.message || 'Error fetching housing entries', isError: true });
          setTimeout(() => setShowPopup({ visible: false, message: '', isError: false }), 3000);
          return;
        }

        const housingData = await housingResponse.json();
        setHousingEntries(housingData);

        // Fetch staff allocations
        const allocationsResponse = await fetch(`http://localhost:5000/api/societies/${societyId}/allocations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!allocationsResponse.ok) {
          const allocationsErrorData = await allocationsResponse.json();
          setShowPopup({ visible: true, message: allocationsErrorData.message || 'Error fetching allocations', isError: true });
          setTimeout(() => setShowPopup({ visible: false, message: '', isError: false }), 3000);
          return;
        }

        const allocationsData = await allocationsResponse.json();
        setAllocations(allocationsData);

        // Fetch listings for the society
        console.log('Fetching listings for societyId:', societyId);
        const listingsResponse = await fetch(`http://localhost:5000/api/listings/${societyId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!listingsResponse.ok) {
          const listingsErrorData = await listingsResponse.json();
          setShowPopup({ visible: true, message: listingsErrorData.message || 'Error fetching listings', isError: true });
          setTimeout(() => setShowPopup({ visible: false, message: '', isError: false }), 3000);
          return;
        }

        const listingsData = await listingsResponse.json();
        setListings(listingsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setShowPopup({ visible: true, message: `Error fetching data: ${error.message}`, isError: true });
        setTimeout(() => setShowPopup({ visible: false, message: '', isError: false }), 3000);
      }
    };

    fetchData();
  }, [navigate]);

  const handleAction = async (requestId, action) => {
    try {
      const token = localStorage.getItem('token');
      const societyId = localStorage.getItem('societyId');

      if (!societyId || !token) {
        setShowPopup({ visible: true, message: 'Society ID or token not found', isError: true });
        setTimeout(() => setShowPopup({ visible: false, message: '', isError: false }), 3000);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/societies/${societyId}/resident-request/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });

      if (!response.ok) {
        const errorData = await response.json();
        setShowPopup({ visible: true, message: errorData.message || 'Error processing request', isError: true });
        setTimeout(() => setShowPopup({ visible: false, message: '', isError: false }), 3000);
        return;
      }

      setRequests(prev => prev.filter(req => req._id !== requestId));
      const successMessage = action === 'approve' ? '✅ Resident request approved!' : '❌ Resident request rejected!';
      setShowPopup({ visible: true, message: successMessage, isError: false });
      setTimeout(() => setShowPopup({ visible: false, message: '', isError: false }), 3000);
    } catch (error) {
      console.error('Error processing request:', error);
      setShowPopup({ visible: true, message: `Error processing request: ${error.message}`, isError: true });
      setTimeout(() => setShowPopup({ visible: false, message: '', isError: false }), 3000);
    }
  };

  const handleIssueStatusUpdate = async (issueId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setShowPopup({ visible: true, message: 'No token found, please log in again', isError: true });
        setTimeout(() => {
          setShowPopup({ visible: false, message: '', isError: false });
          navigate('/login');
        }, 3000);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/issues/${issueId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message.includes('Invalid token') || errorData.message.includes('jwt expired')) {
          setShowPopup({ visible: true, message: 'Session expired, please log in again', isError: true });
          setTimeout(() => {
            setShowPopup({ visible: false, message: '', isError: false });
            localStorage.removeItem('token');
            localStorage.removeItem('societyId');
            navigate('/login');
          }, 3000);
          return;
        }
        setShowPopup({ visible: true, message: errorData.message || 'Error updating issue status', isError: true });
        setTimeout(() => setShowPopup({ visible: false, message: '', isError: false }), 3000);
        return;
      }

      const updatedIssue = await response.json();
      setUnderReviewIssues(prev => prev.filter(issue => issue._id !== issueId));
      if (newStatus === 'Resolved') {
        setResolvedIssues(prev => [...prev, updatedIssue.issue]);
      } else if (newStatus === 'Open') {
        setOpenIssues(prev => [...prev, updatedIssue.issue]);
      }
      setShowPopup({ visible: true, message: `✅ Issue marked as ${newStatus}!`, isError: false });
      setTimeout(() => setShowPopup({ visible: false, message: '', isError: false }), 3000);
    } catch (error) {
      console.error('Error updating issue status:', error);
      setShowPopup({ visible: true, message: `Error updating issue status: ${error.message}`, isError: true });
      setTimeout(() => setShowPopup({ visible: false, message: '', isError: false }), 3000);
    }
  };

  const validateStaffForm = (isEdit = false) => {
    const errors = {};
    const nameRegex = /^[a-zA-Z\s'-]{2,100}$/;
    const phoneRegex = /^\d{1,11}$/;
    const passwordRegex = /^.{6,}$/;

    if (!staffForm.fullName) {
      errors.fullName = 'Full name is required';
    } else if (!nameRegex.test(staffForm.fullName)) {
      errors.fullName = 'Name must be 2-100 characters, letters, spaces, hyphens, or apostrophes only';
    }

    if (!staffForm.phoneNumber) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!phoneRegex.test(staffForm.phoneNumber)) {
      errors.phoneNumber = 'Phone number must be 1-11 digits';
    }

    if (!isEdit && !staffForm.password) {
      errors.password = 'Password is required';
    } else if ((isEdit && staffForm.password) || (!isEdit && staffForm.password)) {
      if (!passwordRegex.test(staffForm.password)) {
        errors.password = 'Password must be at least 6 characters';
      }
    }

    if (!staffForm.role) {
      errors.role = 'Role is required';
    } else if (!['Cleaner', 'Gardener', 'Event Manager', 'Security', 'Maintenance'].includes(staffForm.role)) {
      errors.role = 'Invalid role selected';
    }

    if (!isEdit) {
      const today = new Date().toISOString().split('T')[0];
      if (!staffForm.startDate) {
        errors.startDate = 'Start date is required';
      } else if (staffForm.startDate < today) {
        errors.startDate = 'Start date cannot be in the past';
      }
    }

    return errors;
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    const errors = validateStaffForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setShowPopup({ visible: true, message: 'Please fix form errors', isError: true });
      setTimeout(() => setShowPopup({ visible: false, message: '', isError: false }), 3000);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const societyId = localStorage.getItem('societyId');

      if (!societyId || !token) {
        setShowPopup({ visible: true, message: 'Missing society ID or token', isError: true });
        setTimeout(() => setShowPopup({ visible: false, message: '', isError: false }), 3000);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/societies/staffcreation/${societyId}/staff`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(staffForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        setShowPopup({ visible: true, message: `❌ ${errorData.message || 'Error creating staff'}`, isError: true });
        setTimeout(() => setShowPopup({ visible: false, message: '', isError: false }), 3000);
        setFormErrors({});
        return;
      }

      const newStaff = await response.json();
      setStaff([...staff, newStaff.staff]);
      setStaffForm({ fullName: '', phoneNumber: '', password: '', role: '', startDate: '' });
      setFormErrors({});
      setShowPopup({ visible: true, message: '✅ Staff member created successfully!', isError: false });
      setTimeout(() => setShowPopup({ visible: false, message: '', isError: false }), 3000);
    } catch (error) {
      console.error('Error creating staff:', error);
      setShowPopup({ visible: true, message: `❌ Error creating staff: ${error.message}`, isError: true });
      setTimeout(() => setShowPopup({ visible: false, message: '', isError: false }), 3000);
      setFormErrors({});
    }
  };

  const handleEditStaff = (member) => {
    setEditStaff(member);
    setStaffForm({
      fullName: member.fullName,
      phoneNumber: member.phoneNumber,
      password: '',
      role: member.role,
      startDate: member.startDate || ''
    });
    setFormErrors({});
  };

  const handleEditSubmit = async (updatedStaff) => {
    try {
      const token = localStorage.getItem('token');
      const societyId = localStorage.getItem('societyId');

      if (!societyId || !token) {
        setShowPopup({ visible: true, message: 'Missing society ID or token', isError: true });
        setTimeout(() => setShowPopup({ visible: false, message: '', isError: false }), 3000);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/societies/staffcreation/${societyId}/staff/${editStaff._id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedStaff)
      });

      if (!response.ok) {
        const errorData = await response.json();
        setShowPopup({ visible: true, message: `❌ ${errorData.message || 'Error updating staff'}`, isError: true });
        setTimeout(() => setShowPopup({ visible: false, message: '', isError: false }), 3000);
        setFormErrors({});
        return;
      }

      const updatedStaffResponse = await response.json();
      setStaff(staff.map(s => s._id === editStaff._id ? updatedStaffResponse.staff : s));
      setEditStaff(null);
      setStaffForm({ fullName: '', phoneNumber: '', password: '', role: '', startDate: '' });
      setFormErrors({});
      setShowPopup({ visible: true, message: '✅ Staff member updated successfully!', isError: false });
      setTimeout(() => setShowPopup({ visible: false, message: '', isError: false }), 3000);
    } catch (error) {
      console.error('Error updating staff:', error);
      setShowPopup({ visible: true, message: `❌ Error updating staff: ${error.message}`, isError: true });
      setTimeout(() => setShowPopup({ visible: false, message: '', isError: false }), 3000);
      setFormErrors({});
    }
  };

  const handleDeleteStaff = async (staffId) => {
    try {
      const token = localStorage.getItem('token');
      const societyId = localStorage.getItem('societyId');

      if (!societyId || !token) {
        setShowPopup({ visible: true, message: 'Missing society ID or token', isError: true });
        setTimeout(() => setShowPopup({ visible: false, message: '', isError: false }), 3000);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/societies/staffcreation/${societyId}/staff/${staffId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        setShowPopup({ visible: true, message: `❌ ${errorData.message || 'Error deleting staff'}`, isError: true });
        setTimeout(() => setShowPopup({ visible: false, message: '', isError: false }), 3000);
        return;
      }

      setStaff(staff.filter(s => s._id !== staffId));
      setShowPopup({ visible: true, message: '✅ Staff member deleted successfully!', isError: false });
      setTimeout(() => setShowPopup({ visible: false, message: '', isError: false }), 3000);
    } catch (error) {
      console.error('Error deleting staff:', error);
      setShowPopup({ visible: true, message: `❌ Error deleting staff: ${error.message}`, isError: true });
      setTimeout(() => setShowPopup({ visible: false, message: '', isError: false }), 3000);
    }
  };

  const handleStaffInputChange = (e) => {
    const { name, value } = e.target;
    setStaffForm(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('societyId');
    navigate('/login');
  };

  if (!society) {
    return <div className="loading">Loading society data...</div>;
  }

  const societyId = society._id || localStorage.getItem('societyId');
  const token = localStorage.getItem('token');
  const decodedToken = decodeToken(token);
  const userId = decodedToken?.userId || '';

  if (!societyId || !userId) {
    console.error('No societyId or userId available');
    setShowPopup({ visible: true, message: 'No society ID or user ID available', isError: true });
    setTimeout(() => navigate('/login'), 3000);
    return null;
  }

  return (
    <div className="manager-dashboard">
      <Sidebar
        society={society}
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
        handleLogout={handleLogout}
      />

      <div className="main-content">
        {selectedOption === 'requests' && (
          <ResidentRequests
            requests={requests}
            handleAction={handleAction}
          />
        )}

        {selectedOption === 'staff' && (
          <StaffManagement
            staff={staff}
            staffForm={staffForm}
            formErrors={formErrors}
            handleStaffSubmit={handleStaffSubmit}
            handleEditStaff={handleEditStaff}
            handleDeleteStaff={handleDeleteStaff}
            handleStaffInputChange={handleStaffInputChange}
          />
        )}

        {selectedOption === 'openIssues' && (
          <Issues
            issues={openIssues}
            residents={residents}
            title="Open Issues"
            noIssuesMessage="No open issues at this time."
          />
        )}

        {selectedOption === 'underReview' && (
          <Issues
            issues={underReviewIssues}
            residents={residents}
            title="Under Review Issues"
            noIssuesMessage="No issues under review at this time."
            handleIssueStatusUpdate={handleIssueStatusUpdate}
            showActions={true}
          />
        )}

        {selectedOption === 'resolvedIssues' && (
          <Issues
            issues={resolvedIssues}
            residents={residents}
            title="Resolved Issues"
            noIssuesMessage="No resolved issues at this time."
          />
        )}

        {selectedOption === 'announcements' && (
          <Announcement
            announcements={announcements}
            setAnnouncements={setAnnouncements}
            showPopup={memoizedShowPopup}
            societyId={societyId}
          />
        )}

        {selectedOption === 'housing' && (
          <HousingEntry
            housingEntries={housingEntries}
            setHousingEntries={setHousingEntries}
            showPopup={memoizedShowPopup}
            societyId={societyId}
          />
        )}

        {selectedOption === 'allocation' && (
          <StaffAllocation
            housingEntries={housingEntries}
            staff={staff}
            allocations={allocations}
            setAllocations={setAllocations}
            showPopup={memoizedShowPopup}
            societyId={societyId}
          />
        )}

        {selectedOption === 'marketplaceListings' && (
          <MarketplaceListings
            listings={listings}
            setListings={memoizedSetListings}
            showPopup={memoizedShowPopup}
            societyId={societyId}
          />
        )}

        {selectedOption === 'chat' && (
          <ManagerChat userId={userId} />
        )}
      </div>

      {editStaff && (
        <EditStaffModal
          staffForm={staffForm}
          formErrors={formErrors}
          handleEditSubmit={handleEditSubmit}
          handleStaffInputChange={handleStaffInputChange}
          setEditStaff={setEditStaff}
          setStaffForm={setStaffForm}
          setFormErrors={setFormErrors}
        />
      )}

      {showPopup.visible && (
        <Popup
          message={showPopup.message}
          isError={showPopup.isError}
        />
      )}
    </div>
  );
}