import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, } from 'react-router-dom';
import Signup from './pages/signup';
import Login from './pages/login';
import WaitingForAccess from './pages/waitingForAccess';
import Adminpage from './pages/adminPage';
import ForgotPassword from './pages/forgotPassword';
import './components/App.css';
import ManageUsers from './pages/manageUsers';
import LandingPage from './pages/landingPage';
import ChartOfAccounts from './pages/ChartOfAccounts';
import EditAccounts from './pages/EditAccounts';
import { getUserRole, getUserData } from './components/firestoreUtils'; // Assuming you have these functions implemented
import Ledger from './components/Ledger';
import ManagerPage from './pages/managerPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const userDataString = localStorage.getItem("userData");
      if (userDataString) {
        const uid = JSON.parse(userDataString);
        console.log(await getUserRole(uid))
        await setIsAuthenticated(await getUserRole(uid) === "admin" || await getUserRole(uid) === "Admin");
        console.log(isAuthenticated)
      }
    };
    fetchData();
  }, []);

  const renderProtectedRoute = (Component, path) => {
    return isAuthenticated ? <Component /> : <Navigate to="/login" />;
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/waiting-for-access" element={<WaitingForAccess />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/landing-page" element={<LandingPage />} />
          <Route path="/chart-of-accounts" element={<ChartOfAccounts />} />
          <Route path="/ledger/:accountId" element={<Ledger />} />
          <Route path='/manager-page' element={<ManagerPage />} />
          <Route
            path="/admin-page"
            element={renderProtectedRoute(Adminpage, "/admin-page")}
          />
          <Route
            path="/manage-users"
            element={renderProtectedRoute(ManageUsers, "/manage-users")}
          />
          <Route
            path="/edit-accounts"
            element={renderProtectedRoute(EditAccounts, "/edit-accounts")}
          />
          <Route path="/" element={<ChartOfAccounts />} />
        </Routes>
      </div>
    </Router>

  );
}

export default App;
