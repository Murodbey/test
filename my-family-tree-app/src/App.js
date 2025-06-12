import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Profile from '/Users/murodbey/Documents/test/my-family-tree-app/src/Profile';// Use full path
import EditProfile from '/Users/murodbey/Documents/test/my-family-tree-app/src/EditProfile'; // Import EditProfile
import FamilyMemberList from '/Users/murodbey/Documents/test/my-family-tree-app/src/FamilyMemberList';
import FamilyMemberDetail from '/Users/murodbey/Documents/test/my-family-tree-app/src/FamilyMemberDetail';
import AddFamilyMember from '/Users/murodbey/Documents/test/my-family-tree-app/src/AddFamilyMember';
import EditFamilyMember from '/Users/murodbey/Documents/test/my-family-tree-app/src/EditFamilyMember';
import AddRelationship from '/Users/murodbey/Documents/test/my-family-tree-app/src/AddRelationship';
import Register from '/Users/murodbey/Documents/test/my-family-tree-app/src/Register';
import Login from '/Users/murodbey/Documents/test/my-family-tree-app/src/Login';
import EditRelationship from '/Users/murodbey/Documents/test/my-family-tree-app/src/EditRelationship';
import PrivateRoute from './PrivateRoute';
import { AuthProvider, AuthContext } from './AuthContext';
import { useContext } from 'react';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="App">
          <AuthNav /> {/* Use a separate component for navigation */}
          <main>
            <Routes>
              <Route path="/" element={<div>Home Page (Auth Check Needed)</div>} /> {/* Placeholder for root */}
              <Route path="/register" element={<Register />} /> {/* Registration doesn't require auth */}
              <Route path="/login" element={<Login />} /> {/* Login doesn't require auth */}
              <Route path="/family-members" element={<PrivateRoute element={<FamilyMemberList />} />} /> {/* Protected Route */}
              <Route path="/family-members/:memberId" element={<PrivateRoute element={<FamilyMemberDetail />} />} /> {/* Protected Route */}
              <Route path="/add-family-member" element={<PrivateRoute element={<AddFamilyMember />} />} /> {/* Protected Route */}
              <Route path="/edit-family-member/:memberId" element={<PrivateRoute element={<EditFamilyMember />} />} /> {/* Protected Route */}
              <Route path="/profile" element={<PrivateRoute element={<Profile />} />} /> {/* Protected Route */}
              <Route path="/edit-profile" element={<PrivateRoute element={<EditProfile />} />} /> {/* Protected Route */}
              <Route path="/add-relationship" element={<PrivateRoute element={<AddRelationship />} />} /> {/* Protected Route */}
              <Route path="/edit-relationship/:relationshipId" element={<PrivateRoute element={<EditRelationship />} />} /> {/* Protected Route */}
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Separate component for navigation to use AuthContext
function AuthNav() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav>
      {user ? (
        // Authenticated links
        <>
          <Link to="/profile">Profile</Link> |{' '}
          <Link to="/edit-profile">Edit Profile</Link> |{' '}
          <Link to="/family-members">Family Members</Link> |{' '}
          <Link to="/add-family-member">Add Family Member</Link> |{' '}
          <Link to="/add-relationship">Add Relationship</Link> |{' '}
          <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>
            Logout
          </button>
        </>
      ) : (
        // Not authenticated links
        <>
          <Link to="/register">Register</Link> |{' '}
          <Link to="/login">Login</Link>
        </>
      )}
          <h1>My Family Tree App</h1>
        </nav>
  );
}

export default App;
