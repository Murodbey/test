import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EditFamilyMember() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [familyMember, setFamilyMember] = useState({
    name: '',
    dob: '',
    location: '',
    gender: '',
    photo: '', // Will handle file separately
    dod: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFamilyMember = async () => {
      try { 
        const response = await fetch(`/api/family-members/${memberId}`); // Adjust endpoint if needed
        if (!response.ok) {
          throw new Error('Failed to fetch family member');
        }
        const data = await response.json();
        setFamilyMember(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchFamilyMember();
  }, [memberId]); // Re-run effect if memberId changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFamilyMember({ ...familyMember, [name]: value });
  };

  const handleFileChange = (e) => {
    // Handle file input change - for now, just store the file object
    setFamilyMember({ ...familyMember, photo: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading state for update

    // Prepare data for submission - exclude the file from JSON body for now
    const dataToSubmit = { ...familyMember };
    delete dataToSubmit.photo;
    dataToSubmit.dob = dataToSubmit.dob || null; // Send empty date as null
    dataToSubmit.dod = dataToSubmit.dod || null; // Send empty date as null

    try {
      const response = await fetch(`/edit_member/${memberId}`, { // Adjust endpoint if needed
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        throw new Error('Failed to update family member');
      }

      // Handle photo upload separately if a new file was selected
      if (familyMember.photo instanceof File) {
        const formData = new FormData();
        formData.append('photo', familyMember.photo);
 
        const photoUploadResponse = await fetch(`/api/family-members/${memberId}/photo`, { // Example endpoint for photo upload
          method: 'POST', // Or PUT, depending on your API design
          body: formData,
        });

        if (!photoUploadResponse.ok) {
          console.error('Failed to upload photo');
          // Handle photo upload error, but don't block navigation if profile data updated
        }
      }

      setLoading(false);
      navigate(`/family-members/${memberId}`); // Navigate back to the family member detail page (adjust path if needed)
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading family member details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="family-member-form">
      <h1>Edit {familyMember.name}</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Full Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={familyMember.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="dob">Date of Birth:</label>
          <input
            type="date"
            id="dob"
            name="dob"
            value={familyMember.dob}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="location">Birth Place:</label>
          <input
            type="text"
            id="location"
            name="location"
            value={familyMember.location}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="gender">Gender:</label>
          <select id="gender" name="gender" value={familyMember.gender} onChange={handleChange}>
            <option value="">--Select Gender--</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>
        <div>
          <label htmlFor="photo">Photo:</label>
          <input
            type="file"
            id="photo"
            name="photo"
            accept="image/*"
            onChange={handleFileChange}
          />
          {familyMember.photo && typeof familyMember.photo === 'string' && (
            <p>Current Photo: {familyMember.photo.split('/').pop()}</p> // Display current photo filename if it's a string path
          )}
        </div>
        <div>
          <label htmlFor="dod">Date of Death:</label>
          <input
            type="date"
            id="dod"
            name="dod"
            value={familyMember.dod}
            onChange={handleChange}
          />
        </div>
        <button type="submit" disabled={loading}>
          Save Changes
        </button>
      </form>
      <p><button onClick={() => navigate(`/family-members/${memberId}`)}>Cancel</button></p> {/* Adjust path if needed */}
    </div>
  );
}

export default EditFamilyMember;