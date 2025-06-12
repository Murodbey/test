import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css'; // Import the CSS file
function AddRelationship() {
  const [formData, setFormData] = useState({
    member1_id: '',
    member2_id: '',
    relationship_type: ''
  });
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFamilyMembers = async () => {
      try {
        const response = await fetch('/dashboard'); // Adjust endpoint if needed
        if (!response.ok) {
          throw new Error('Failed to fetch family members');
        }
        const data = await response.json();
        setFamilyMembers(data.family_members); // Assuming the response has a 'family_members' key
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchFamilyMembers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/add_relationship', { // Adjust endpoint if needed
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          member1_id: parseInt(formData.member1_id), // Ensure IDs are integers
          member2_id: parseInt(formData.member2_id),
          relationship_type: formData.relationship_type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add relationship');
      }

      // Assuming a successful addition returns a 200 status or a success message
      setLoading(false);
      // Navigate to a relevant page, e.g., dashboard
      navigate('/dashboard'); // Adjust navigation path as needed
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading family members...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="add-relationship-container"> {/* Add a class for potential styling */}
      <h1>Add New Relationship</h1>
      <form onSubmit={handleSubmit} className="family-member-form">
        <div>
          <label htmlFor="member1_id">Member 1:</label>
          <select
            id="member1_id"
            name="member1_id"
            value={formData.member1_id}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Member --</option>
            {familyMembers.map(member => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="relationship_type">Relationship Type:</label>
          <input
            type="text"
            id="relationship_type"
            name="relationship_type"
            value={formData.relationship_type}
            onChange={handleChange}
            required
          />
           {/* Or use a select dropdown for predefined relationship types */}
           {/* <select
             id="relationship_type"
             name="relationship_type"
             value={formData.relationship_type}
             onChange={handleChange}
             required
           >
             <option value="">--Select Type--</option>
             <option value="parent">Parent</option>
             <option value="child">Child</option>
             {/* Add more options based on your relationship types */}
           {/* </select> */}
        </div>
        <div>
          <label htmlFor="member2_id">Member 2:</label>
          <select
            id="member2_id"
            name="member2_id"
            value={formData.member2_id}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Member --</option>
            {familyMembers.map(member => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Add Relationship</button>
      </form>
    </div>
  );
}

export default AddRelationship;