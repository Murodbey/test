import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Assuming you are using react-router-dom for navigation

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch user profile data
    fetch('/api/profile')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, []); // The empty array ensures this effect runs only once, on mount

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!user) {
    return <div>User not found or not logged in.</div>;
  }

  return (
    <div>
      <h1>User Profile</h1>
      <p><strong>Username:</strong> {user.username}</p>
      {user.email && <p><strong>Email:</strong> {user.email}</p>}

      {/* Link to the edit profile page */}
      <Link to="/edit-profile">Edit Profile</Link>
    </div>
  );
}

export default Profile;