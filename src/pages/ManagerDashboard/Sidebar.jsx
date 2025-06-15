

// import React from 'react';

// export default function Sidebar({ society, selectedOption, setSelectedOption, handleLogout }) {
//   return (
//     <div className="sidebar">
//       <div className="society-profile">
//         <h1>{society.name || 'Unnamed Society'}</h1>
//         <h3>System Admin: {society.managerName || 'N/A'}</h3>
//         <p>📍 {society.address || 'No address provided'}</p>
//         <p>📅 Created: {society.dateOfCreation ? new Date(society.dateOfCreation).toLocaleDateString() : 'Unknown'}</p>
//         <p>🆔 Unique ID: {society.uniqueIdCode || 'N/A'}</p>
//       </div>
//       <div className="sidebar-options">
//         <button
//           className={`sidebar-button ${selectedOption === 'requests' ? 'active' : ''}`}
//           onClick={() => setSelectedOption('requests')}
//         >
//           🏠 Resident Requests
//         </button>
//         <button
//           className={`sidebar-button ${selectedOption === 'staff' ? 'active' : ''}`}
//           onClick={() => setSelectedOption('staff')}
//         >
//           👷 Staff Management
//         </button>
//         <button
//           className={`sidebar-button ${selectedOption === 'openIssues' ? 'active' : ''}`}
//           onClick={() => setSelectedOption('openIssues')}
//         >
//           📋 Open Issues
//         </button>
//         <button
//           className={`sidebar-button ${selectedOption === 'underReview' ? 'active' : ''}`}
//           onClick={() => setSelectedOption('underReview')}
//         >
//           🔍 Under Review
//         </button>
//         <button
//           className={`sidebar-button ${selectedOption === 'resolvedIssues' ? 'active' : ''}`}
//           onClick={() => setSelectedOption('resolvedIssues')}
//         >
//           ✅ Resolved Issues
//         </button>
//         <button
//           className={`sidebar-button ${selectedOption === 'announcements' ? 'active' : ''}`}
//           onClick={() => setSelectedOption('announcements')}
//         >
//           📢 Announcements
//         </button>
//         <button
//           className={`sidebar-button ${selectedOption === 'housing' ? 'active' : ''}`}
//           onClick={() => setSelectedOption('housing')}
//         >
//           🏡 Housing Entry
//         </button>
//         <button
//           className={`sidebar-button ${selectedOption === 'allocation' ? 'active' : ''}`}
//           onClick={() => setSelectedOption('allocation')}
//         >
//           🤝 Staff Allocation
//         </button>
//         <button
//           className="sidebar-button logout-button"
//           onClick={handleLogout}
//         >
//           🚪 Logout
//         </button>
//       </div>
//     </div>
//   );
// }

import React from 'react';

export default function Sidebar({ society, selectedOption, setSelectedOption, handleLogout }) {
  return (
    <div className="sidebar">
      <div className="society-profile">
        <h1>{society.name || 'Unnamed Society'}</h1>
        <h3>System Admin: {society.managerName || 'N/A'}</h3>
        <p>📍 {society.address || 'No address provided'}</p>
        <p>📅 Created: {society.dateOfCreation ? new Date(society.dateOfCreation).toLocaleDateString() : 'Unknown'}</p>
        <p>🆔 Unique ID: {society.uniqueIdCode || 'N/A'}</p>
      </div>
      <div className="sidebar-options">
        <button
          className={`sidebar-button ${selectedOption === 'requests' ? 'active' : ''}`}
          onClick={() => setSelectedOption('requests')}
        >
          🏠 Resident Requests
        </button>
        <button
          className={`sidebar-button ${selectedOption === 'staff' ? 'active' : ''}`}
          onClick={() => setSelectedOption('staff')}
        >
          👷 Staff Management
        </button>
        <button
          className={`sidebar-button ${selectedOption === 'openIssues' ? 'active' : ''}`}
          onClick={() => setSelectedOption('openIssues')}
        >
          📋 Open Issues
        </button>
        <button
          className={`sidebar-button ${selectedOption === 'underReview' ? 'active' : ''}`}
          onClick={() => setSelectedOption('underReview')}
        >
          🔍 Under Review
        </button>
        <button
          className={`sidebar-button ${selectedOption === 'resolvedIssues' ? 'active' : ''}`}
          onClick={() => setSelectedOption('resolvedIssues')}
        >
          ✅ Resolved Issues
        </button>
        <button
          className={`sidebar-button ${selectedOption === 'announcements' ? 'active' : ''}`}
          onClick={() => setSelectedOption('announcements')}
        >
          📢 Announcements
        </button>
        <button
          className={`sidebar-button ${selectedOption === 'housing' ? 'active' : ''}`}
          onClick={() => setSelectedOption('housing')}
        >
          🏡 Housing Entry
        </button>
        <button
          className={`sidebar-button ${selectedOption === 'allocation' ? 'active' : ''}`}
          onClick={() => setSelectedOption('allocation')}
        >
          🤝 Staff Allocation
        </button>
        <button
          className={`sidebar-button ${selectedOption === 'marketplaceListings' ? 'active' : ''}`}
          onClick={() => setSelectedOption('marketplaceListings')}
        >
          🏠 Marketplace Listings
        </button>
        <button
          className="sidebar-button logout-button"
          onClick={handleLogout}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}