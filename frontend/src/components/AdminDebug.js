import React from 'react';
import { useAuth } from '../context/AuthContext';

// Temporary debug component to check admin status
const AdminDebug = () => {
  const { user, authenticated } = useAuth();

  if (!authenticated) {
    return null;
  }

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      background: '#fff', 
      padding: '10px', 
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <strong>Debug Info:</strong><br/>
      Authenticated: {authenticated ? 'Yes' : 'No'}<br/>
      User: {user?.username || 'None'}<br/>
      is_admin: {String(user?.is_admin)}<br/>
      is_admin type: {typeof user?.is_admin}<br/>
      is_admin === true: {String(user?.is_admin === true)}<br/>
    </div>
  );
};

export default AdminDebug;

