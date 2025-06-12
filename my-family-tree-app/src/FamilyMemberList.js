import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function FamilyMemberList() {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFamilyMembers = async () => {
      try {
        const response = await fetch('/dashboard'); // Fetch from the dashboard endpoint
        if (!response.ok) {
          throw new Error('Failed to fetch family members');
        }
        const data = await response.json();
        setFamilyMembers(data.family_members || []); // Adjust based on your API response structure
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchFamilyMembers();
  }, []); // Empty dependency array means this effect runs once on mount

  if (loading) {
    return <div>Loading family members...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (familyMembers.length === 0) {
    return <div>No family members found. Add some!</div>;
  }

  return (
    <div className="family-member-list">
      <h2>Family Members</h2>
      <ul>
        {familyMembers.map(member => (
          <li key={member.id} className="family-member-item">
            {/* Link to the view member page */}
            <Link to={`/family-members/${member.id}`}>{member.name}</Link> {/* Corrected link path */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FamilyMemberList;