import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Watchlist.css';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authenticated) {
      fetchWatchlist();
    } else {
      setLoading(false);
    }
  }, [authenticated]);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const response = await api.get('/watchlist');
      setWatchlist(response.data.watchlist);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Remove this movie from your watchlist?')) {
      return;
    }

    try {
      await api.delete(`/watchlist/${id}`);
      setWatchlist(watchlist.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      alert('Failed to remove from watchlist');
    }
  };

  if (!authenticated) {
    return (
      <div className="watchlist-page">
        <h1>My Watchlist</h1>
        <div className="login-prompt">
          <h3>Login Required</h3>
          <p>Please log in to view and manage your watchlist.</p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>
            Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading watchlist...</div>;
  }

  return (
    <div className="watchlist-page">
      <h1>My Watchlist</h1>

      {watchlist.length > 0 ? (
        <div className="watchlist-grid">
          {watchlist.map((item) => (
            <div key={item.id} className="watchlist-item">
              <h3>{item.movie_title} ({item.movie_year})</h3>
              {item.movie_poster && (
                <img src={item.movie_poster} alt={item.movie_title} className="movie-poster" />
              )}
              {item.director && <p className="director">Director: {item.director}</p>}
              {item.genre && <p className="genre">Genre: {item.genre}</p>}
              {item.notes && <p className="notes">{item.notes}</p>}
              <div className="item-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => handleRemove(item.id)}
                >
                  Remove
                </button>
              </div>
              <p className="added-date">
                Added: {new Date(item.added_date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>Your watchlist is empty</h3>
          <p>Start adding movies you want to watch!</p>
        </div>
      )}
    </div>
  );
};

export default Watchlist;

