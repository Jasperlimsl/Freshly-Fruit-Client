import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../App';

function ProtectedRoute({ children, roles }) {

  const { authState } = useContext(AuthContext);

  if (!authState.status) {
      // User is not authenticated
      return <Navigate to="/login" />;
    }

    if (roles && !roles.includes(authState.role)) {
      // User is authenticated but role is not authorised
      return <Navigate to="/" />;
    }

    // User is authenticated and role is authorised
    return children;
  };

export default ProtectedRoute
