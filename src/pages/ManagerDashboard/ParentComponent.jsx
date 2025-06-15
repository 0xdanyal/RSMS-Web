import { useState, useEffect } from 'react';
import Issues from './Issues';

export default function ParentComponent() {
  const [issues, setIssues] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found. Please log in.');
        }
        console.log('Using token:', token.substring(0, 20) + '...');

        // Fetch issues
        console.log('Fetching issues from http://localhost:5000/api/issues');
        const issuesResponse = await fetch('http://localhost:5000/api/issues', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!issuesResponse.ok) {
          const errorText = await issuesResponse.text();
          throw new Error(`Failed to fetch issues: ${issuesResponse.status} - ${errorText}`);
        }
        const issuesData = await issuesResponse.json();
        setIssues(issuesData);
        console.log('Issues:', issuesData);

        // Fetch residents for the society
        const societyId = issuesData[0]?.society || '680d50c47329748ed3c4009e';
        console.log(`Fetching residents from http://localhost:5000/api/societies/residents?society=${societyId}`);
        const residentsResponse = await fetch(`http://localhost:5000/api/societies/residents?society=${societyId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!residentsResponse.ok) {
          const errorText = await residentsResponse.text();
          throw new Error(`Failed to fetch residents: ${residentsResponse.status} - ${errorText}`);
        }
        const residentsData = await residentsResponse.json();
        setResidents(residentsData);
        console.log('Residents:', residentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Issues
      issues={issues}
      residents={residents}
      title="Issues"
      noIssuesMessage="No issues found"
      handleIssueStatusUpdate={(id, status) => {
        console.log(`Update issue ${id} to status ${status}`);
      }}
      showActions={true}
    />
  );
}