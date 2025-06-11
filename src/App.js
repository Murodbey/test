import React, { useState, useEffect } from 'react';
import './App.css'; // Assuming you have an App.css

import FamilyMemberCard from './FamilyMemberCard'; // Import the new component

function App() {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch data from your Flask backend
    const fetchData = async () => {
      try {
        // Fetch family members and relationships from the dashboard endpoint
        const response = await fetch('http://127.0.0.1:5000/dashboard'); // Adjust URL if needed
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setFamilyMembers(data.family_members);
        setRelationships(data.relationships);
      } catch (error) {
        setError(error);
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this effect runs once on mount

  if (loading) {
    return <div>Loading family data...</div>;
  }

  if (error) {
    return <div>Error loading data: {error.message}</div>;
  }

  return (
    <div className="App">
      <h1>Family Tree</h1>

      <h2>Family Members ({familyMembers.length})</h2>
      <div className="family-members-list"> {/* Add a container div */}
        {familyMembers.map(member => (
          <FamilyMemberCard key={member.id} member={member} />
        ))}
      </div>

      <h2>Relationships ({relationships.length})</h2>
      {/* We'll work on displaying relationships more meaningfully later */}
      <ul>
        {relationships.map(relationship => (
          <li key={relationship.id}>
            {relationship.member1_id} - {relationship.relationship_type} - {relationship.member2_id}
          </li>
        ))}
      </ul>

      {/* Family tree visualization will go here later */}
    </div>
  );
}

export default App;