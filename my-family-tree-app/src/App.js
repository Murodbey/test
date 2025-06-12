import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Profile from './Profile';// Use full path
import EditProfile from '.\/EditProfile'; // Import EditProfile

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <nav>
          <Link to="/profile">Profile</Link> | {' '}
          <Link to="/edit-profile">Edit Profile</Link>
          <h1>My Family Tree App</h1>
        </nav>
        <main>
          <Routes>
            <Route path="/profile" element={<Profile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
