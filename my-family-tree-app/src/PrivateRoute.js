import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

function PrivateRoute({ element }) {
  const { user } = useContext(AuthContext); // Assuming your AuthContext provides a 'user' object or similar to indicate authentication

  if (!user) { // Check if user is not authenticated
    return <Navigate to="/login" replace />;
  }

  return element; // Render the element prop if authenticated
}

export default PrivateRoute;