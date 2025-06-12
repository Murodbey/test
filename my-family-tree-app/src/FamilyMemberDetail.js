import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

function FamilyMemberDetail({  }) { // Added prop for potential future use
 const { memberId } = useParams();
  const [familyMember, setFamilyMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
 
  useEffect(() => {
    const fetchFamilyMember = async () => {
      try {
        const response = await fetch(`/member/${memberId}`); // Corrected endpoint based on app.py routing
 if (!response.ok) {
          throw new Error('Failed to fetch family member');
        }
        const data = await response.json();
        setFamilyMember(data);
        setLoading(false);
        setError(null); // Clear previous errors on successful fetch
      } catch (error) {
        setError(error.message);
        setLoading(false);
 }
    };
 
    fetchFamilyMember();
  }, [memberId]); // Dependency array includes memberId to refetch if it changes
 
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this family member?')) {
      try {
        const response = await fetch(`/delete_member/${memberId}`, { // Corrected endpoint based on app.py routing
          method: 'DELETE',
        });
        if (!response.ok) { 
          throw new Error('Failed to delete family member');
        }

        // Assuming successful deletion returns a 200 status
        navigate('/dashboard'); // Navigate back to the dashboard or list page
      } catch (error) {
        setError(error.message);
        setLoading(false); // Ensure loading is false after an error
      }
    }
  };
 
  if (loading) {
    return <div>Loading family member details...</div>;
  }
 
  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!familyMember) {
    return <div>Family member not found.</div>;
  }

 return (
    <div className="family-member-details">
      <h1>{familyMember.name}</h1>
      {familyMember.photo && (
        <div>
          <img src={familyMember.photo} alt={`${familyMember.name}'s Photo`} style={{ maxWidth: '200px', height: 'auto' }} />
        </div>
      )}
      <div>
        <strong>Date of Birth:</strong> {familyMember.dob ? familyMember.dob : 'N/A'} {/* Added check for dob */}
      </div>
      <div>
        <strong>Place of Birth:</strong> {familyMember.location}
      </div>
      <div>
        <strong>Gender:</strong> {familyMember.gender}
      </div>
      {familyMember.dod && (
        <div>
          <strong>Date of Death:</strong> {familyMember.dod}
        </div>
      )}
 
      {/* Add more details as needed */}

      <Link to={`/edit-family-member/${familyMember.id}`}>Edit Member</Link>
      <button onClick={handleDelete}>Delete Member</button>
      {/* You might want to add links to view relationships here later */}

      <p><Link to="/dashboard">Back to Dashboard</Link></p> {/* Assuming you have a dashboard route */}
    </div>
  );
}

export default FamilyMemberDetail;