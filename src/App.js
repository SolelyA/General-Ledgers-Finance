import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Signup from './pages/signup';
import Login from './pages/login';
import WaitingForAccess from './pages/waitingForAccess';
import Adminpage from './pages/adminPage';
import ForgotPassword from './pages/forgotPassword';
import './components/App.css';
import ManageUsers from './pages/manageUsers';
import LandingPage from './pages/landingPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route exact path="/" element={<Navigate to="/login" />} />
          <Route exact path="/signup" element={<Signup />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/waiting-for-access" element={<WaitingForAccess />}/>
          <Route exact path="/admin-page" element={<Adminpage />}/>
          <Route exact path="/forgot-password" element={<ForgotPassword />}/>
          <Route exact path="/manage-users" element={<ManageUsers />} />
          <Route exact path="/landing-page" element={<LandingPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;