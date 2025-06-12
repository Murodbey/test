import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

function EditRelationship() {
  const { relationshipId } = useParams();
  const navigate = useNavigate();
  const [relationship, setRelationship] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    member1_id: '',
    member2_id: '',
    relationship_type: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch relationship data
        const relationshipResponse = await fetch(`${BASE_URL}/edit_relationship/${relationshipId}`);
        if (!relationshipResponse.ok) {
          throw new Error('Failed to fetch relationship');
        }
        const relationshipData = await relationshipResponse.json();
        setRelationship(relationshipData);
        setFormData({
          member1_id: relationshipData.member1_id,
          member2_id: relationshipData.member2_id,
          relationship_type: relationshipData.relationship_type
        });

        // Fetch family members data
        const membersResponse = await fetch(`${BASE_URL}/dashboard`); // Assuming /dashboard returns family members
        if (!membersResponse.ok) {
          throw new Error('Failed to fetch family members');
        }
        const membersData = await membersResponse.json(); // Assuming the response is directly the list of members or has a key like 'family_members'
        setFamilyMembers(membersData.family_members); // Adjust if your endpoint returns a different structure

        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [relationshipId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/update_relationship/${relationshipId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update relationship');
      }

      // Assuming a successful update returns a 200 status
      setLoading(false);
      // Navigate to the detail page of one of the members in the relationship
      navigate(`/family-members/${formData.member1_id}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading relationship...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!relationship || familyMembers.length === 0) {
    return <div>Relationship or family members not found.</div>;
  }

  return (
    <div>
      <h1>Edit Relationship</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="member1_id">Member 1:</label>
          <select
            id="member1_id"
            name="member1_id"
            value={formData.member1_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Member 1</option>
            {familyMembers.map(member => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </select>
        </div>
        <br />
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
        </div>
        <br />
        <div>
          <label htmlFor="member2_id">Member 2:</label>
          <select
            id="member2_id"
            name="member2_id"
            value={formData.member2_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Member 2</option>
            {familyMembers.map(member => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </select>
        </div>
        <br />
        <button type="submit" disabled={loading}>
          Save Changes
        </button>
      </form>
      <p><button onClick={() => navigate(`/family-members/${formData.member1_id}`)}>Cancel</button></p>
    </div>
  );
}

export default EditRelationship;