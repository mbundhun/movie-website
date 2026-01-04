import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Movies.css';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    year: '',
    director: '',
    genre: '',
    poster_url: '',
    imdb_id: ''
  });
  const { authenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/movies');
      setMovies(response.data.movies);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const params = searchTerm ? { search: searchTerm } : {};
      const response = await api.get('/movies', { params });
      setMovies(response.data.movies);
    } catch (error) {
      console.error('Error searching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMovie = async (e) => {
    e.preventDefault();
    if (!authenticated) {
      navigate('/login');
      return;
    }

    try {
      const response = await api.post('/movies', formData);
      setMovies([response.data, ...movies]);
      setFormData({
        title: '',
        year: '',
        director: '',
        genre: '',
        poster_url: '',
        imdb_id: ''
      });
      setShowAddForm(false);
      alert('Movie added successfully!');
    } catch (error) {
      console.error('Error adding movie:', error);
      alert(error.response?.data?.message || 'Failed to add movie');
    }
  };

  const handleAddToWatchlist = async (movieId) => {
    if (!authenticated) {
      navigate('/login');
      return;
    }

    try {
      await api.post('/watchlist', { movie_id: movieId });
      alert('Added to watchlist!');
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      alert(error.response?.data?.message || 'Failed to add to watchlist');
    }
  };

  const filteredMovies = movies.filter(movie =>
    !searchTerm || movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Loading movies...</div>;
  }

  return (
    <div className="movies-page">
      <div className="page-header">
        <h1>Movies</h1>
        {authenticated ? (
          <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Cancel' : 'Add Movie'}
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => navigate('/login')}>
            Add Movie
          </button>
        )}
      </div>

      {showAddForm && authenticated && (
        <div className="add-movie-form">
          <h2>Add New Movie</h2>
          <form onSubmit={handleAddMovie}>
            <div className="form-row">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Year</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Director</label>
                <input
                  type="text"
                  value={formData.director}
                  onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Genre</label>
                <input
                  type="text"
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Poster URL</label>
              <input
                type="url"
                value={formData.poster_url}
                onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>IMDB ID</label>
              <input
                type="text"
                value={formData.imdb_id}
                onChange={(e) => setFormData({ ...formData, imdb_id: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Add Movie
            </button>
          </form>
        </div>
      )}

      <div className="search-section">
        <input
          type="text"
          placeholder="Search movies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn btn-primary" onClick={handleSearch}>
          Search
        </button>
        {searchTerm && (
          <button className="btn btn-secondary" onClick={() => {
            setSearchTerm('');
            fetchMovies();
          }}>
            Clear
          </button>
        )}
      </div>

      <div className="movies-grid">
        {filteredMovies.length > 0 ? (
          filteredMovies.map((movie) => (
            <div key={movie.id} className="movie-card">
              {movie.poster_url && (
                <img src={movie.poster_url} alt={movie.title} className="movie-poster" />
              )}
              <div className="movie-info">
                <h3>{movie.title}</h3>
                {movie.year && <p className="year">{movie.year}</p>}
                {movie.director && <p className="director">Director: {movie.director}</p>}
                {movie.genre && <p className="genre">Genre: {movie.genre}</p>}
                <div className="movie-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/reviews?movie_id=${movie.id}`)}
                  >
                    View Reviews
                  </button>
                  {authenticated && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleAddToWatchlist(movie.id)}
                    >
                      Add to Watchlist
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <h3>No movies found</h3>
            <p>Try a different search term or add a new movie!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Movies;

