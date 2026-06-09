import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isTokenExpired } from '../utils/jwtUtils';

export default function PrivateRoute() {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  if (isTokenExpired(auth.token)) {
    auth.logout();
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
