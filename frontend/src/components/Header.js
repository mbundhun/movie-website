import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { authenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header>
      <nav>
        <div className="nav-brand">
          <Link to="/">Movie Reviews</Link>
        </div>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/movies">Movies</Link></li>
          <li><Link to="/reviews">Reviews</Link></li>
          <li><Link to="/watchlist">Watchlist</Link></li>
          <li><Link to="/stats">Statistics</Link></li>
        </ul>
        <div className="auth-buttons">
          {authenticated ? (
            <>
              <span className="user-info">Welcome, {user?.username}</span>
              <button className="btn btn-secondary" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary">
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;

