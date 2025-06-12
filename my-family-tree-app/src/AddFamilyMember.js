import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

function AddFamilyMember() {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    location: '',
    gender: '',
    dod: '',
  });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const dataToSubmit = new FormData();
    dataToSubmit.append('name', formData.name);
    dataToSubmit.append('dob', formData.dob);
    dataToSubmit.append('location', formData.location);
    dataToSubmit.append('gender', formData.gender);
    dataToSubmit.append('dod', formData.dod);
    if (photo) {
      dataToSubmit.append('photo', photo);
    }

    try {
      // Adjust the API endpoint if it's different in your Flask app
      const response = await fetch(`${BASE_URL}/add_member`, { // Assuming '/add_member' is your API endpoint
        method: 'POST',
        body: dataToSubmit, // Use FormData for file uploads
      });

      if (!response.ok) {
        // You might want to read the error response from the backend
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add family member');
      }

      // Assuming the backend returns the new member's ID or data
      // const newMemberData = await response.json();
      setLoading(false);
      // Example: navigate(`/members/${newMemberData.id}`);
      navigate('/dashboard'); // Navigate to dashboard for now

    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
          <label htmlFor="name">Full Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        <div>
          <label htmlFor="dob">Date of Birth:</label>
          <input
            type="date"
            id="dob"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
          />
        <div>
          <label htmlFor="location">Place of Birth:</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
        <div>
          <label htmlFor="gender">Gender:</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>
          <label htmlFor="photo">Photo:</label>
          <input
            type="file"
            id="photo"
            name="photo"
 accept="image/*"
            onChange={handleFileChange}
          />
        <div>
          <label htmlFor="dod">Date of Death:</label>
          <input
            type="date"
            id="dod"
            name="dod"
            value={formData.dod}
            onChange={handleChange}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Member'}
        </button>
      </form>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}

export default AddFamilyMember;