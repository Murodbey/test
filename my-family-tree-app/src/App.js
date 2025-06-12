import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Profile from '/Users/murodbey/Documents/test/my-family-tree-app/src/Profile';// Use full path
import EditProfile from './EditProfile'; // Import EditProfile
import FamilyMemberList from '/Users/murodbey/Documents/test/my-family-tree-app/src/FamilyMemberList';
import FamilyMemberDetail from '/Users/murodbey/Documents/test/my-family-tree-app/src/FamilyMemberDetail';
import AddFamilyMember from '/Users/murodbey/Documents/test/my-family-tree-app/src/AddFamilyMember';
import EditFamilyMember from '/Users/murodbey/Documents/test/my-family-tree-app/src/EditFamilyMember';
import AddRelationship from '/Users/murodbey/Documents/test/my-family-tree-app/src/AddRelationship';
import Register from '/Users/murodbey/Documents/test/my-family-tree-app/src/Register';
import Login from '/Users/murodbey/Documents/test/my-family-tree-app/src/Login';
import EditRelationship from '/Users/murodbey/Documents/test/my-family-tree-app/src/EditRelationship';
 
function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <nav>
          <Link to="/profile">Profile</Link> | {' '}
          <Link to="/edit-profile">Edit Profile</Link>
          {' | '} <Link to="/family-members">Family Members</Link>
          {' | '} <Link to="/add-family-member">Add Family Member</Link>
          <h1>My Family Tree App</h1>
 {' | '} <Link to="/add-relationship">Add Relationship</Link>
        </nav>
        <main>
          <Routes>
            <Route path="/" element={<div>Home Page (Auth Check Needed)</div>} /> {/* Placeholder for root */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/family-members" element={<FamilyMemberList />} />
            <Route path="/family-members/:memberId" element={<FamilyMemberDetail />} />
            <Route path="/add-family-member" element={<AddFamilyMember />} />
            <Route path="/edit-family-member/:memberId" element={<EditFamilyMember />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/add-relationship" element={<AddRelationship />} />
            <Route path="/edit-relationship/:relationshipId" element={<EditRelationship />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
