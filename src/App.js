import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Signup from './pages/signup';
import Login from './pages/login';
import WaitingForAccess from './pages/waitingForAccess';
import Adminpage from './pages/adminPage';
import ForgotPassword from './pages/forgotPassword';
import './App.css';

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
          <Route exact path ="/forgot-password" element={<ForgotPassword />}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;