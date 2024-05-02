import React from 'react';
import { Route, Navigate } from 'react-router-dom';

//This function enables the application to have routes that only authenticated users can access
const ProtectedRoute = ({ element: Element, isAuthenticated, ...rest }) => {
  return (
    <Route
      {...rest}
      element={isAuthenticated ? <Element /> : <Navigate to="/login" />}
    />
  );
};

export default ProtectedRoute;
