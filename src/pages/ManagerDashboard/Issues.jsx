import './ManagerDashboard.css';

export default function Issues({ issues, title, noIssuesMessage, handleIssueStatusUpdate, showActions, residents }) {
  console.log('Issues received:', issues);
  console.log('Residents received:', residents);

  return (
    <div className="issues">
      <h2>{title}</h2>
      {issues.length === 0 ? (
        <p className="no-issues">{noIssuesMessage}</p>
      ) : (
        issues.map(issue => {
          const resident = residents?.find(res => res.user?._id.toString() === issue.reporterUser?.toString()) || {};
          console.log(`Issue reporterUser: ${issue.reporterUser}, Matched resident:`, resident);
          return (
            <div key={issue._id} className="issue-card">
              <p><strong>📌 Title:</strong> {issue.title}</p>
              <p><strong>📝 Description:</strong> {issue.description}</p>
              <p><strong>👤 Reported by:</strong> {issue.reporter || 'Unknown'}</p>
              {/* <p><strong>🏠 Address:</strong> {resident.user?.address || 'N/A'}</p>
              <p><strong>🏠 House Number:</strong> {resident.houseNumber || 'N/A'}</p> */}
             {/* <p><strong>🏠 Address:</strong> {resident.user?.address || 'N/A'}</p>
<p><strong>🏠 House Number:</strong> {resident.user?.houseNumber || 'N/A'}</p> */}

              <p><strong>👷 Assigned to:</strong> {issue.role}</p>
              <p><strong>📅 Created:</strong> {new Date(issue.createdAt).toLocaleDateString()}</p>
              <p><strong>🟡 Status:</strong> {issue.status}</p>
              <p><strong>📋 Issue Type:</strong> <span className="issue-type"><strong>{issue.issueType}</strong></span></p>
              {showActions && (
                <div className="issue-actions">
                  <button
                    className="approve-button"
                    onClick={() => handleIssueStatusUpdate(issue._id, 'Resolved')}
                  >
                    Resolve ✅
                  </button>
                  <button
                    className="reject-button"
                    onClick={() => handleIssueStatusUpdate(issue._id, 'Open')}
                  >
                    Reopen 🔄
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}