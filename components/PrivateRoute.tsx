import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../App';

const PrivateRoute: React.FC = () => {
  const { user } = useApp();

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
