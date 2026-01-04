import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import './Movies.css';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [genres, setGenres] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    year: '',
    director: '',
    poster_url: '',
    imdb_id: ''
  });
  const [selectedGenres, setSelectedGenres] = useState([]);
  const { authenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMovies();
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      const response = await api.get('/genres');
      setGenres(response.data.genres || []);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/movies?include_genres=true');
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
      const params = searchTerm ? { search: searchTerm, include_genres: 'true' } : { include_genres: 'true' };
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
      // Send genres as array of genre names
      const genreNames = selectedGenres.map(genreId => {
        const genre = genres.find(g => g.id === genreId);
        return genre ? genre.name : null;
      }).filter(Boolean);
      
      const movieData = {
        ...formData,
        genres: genreNames
      };
      
      const response = await api.post('/movies', movieData);
      setMovies([response.data, ...movies]);
      setFormData({
        title: '',
        year: '',
        director: '',
        poster_url: '',
        imdb_id: ''
      });
      setSelectedGenres([]);
      setShowAddForm(false);
      alert('Movie added successfully!');
    } catch (error) {
      console.error('Error adding movie:', error);
      alert(error.response?.data?.message || 'Failed to add movie');
    }
  };

  const handleGenreToggle = (genreId) => {
    setSelectedGenres(prev => {
      if (prev.includes(genreId)) {
        return prev.filter(id => id !== genreId);
      } else {
        return [...prev, genreId];
      }
    });
  };

  const formatGenres = (genresArray) => {
    if (!genresArray || genresArray.length === 0) return '';
    return genresArray.map(g => g.name).join(', ');
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
                <label>Genres</label>
                <select
                  multiple
                  className="genres-dropdown"
                  value={selectedGenres.map(String)}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                    setSelectedGenres(selected);
                  }}
                >
                  {genres.map(genre => (
                    <option key={genre.id} value={genre.id}>
                      {genre.name}
                    </option>
                  ))}
                </select>
                {selectedGenres.length > 0 && (
                  <div className="selected-genres-display">
                    <strong>Selected genres:</strong>
                    <div className="selected-genres-tags">
                      {selectedGenres.map(id => {
                        const genre = genres.find(g => g.id === id);
                        return genre ? (
                          <span key={id} className="genre-tag">
                            {genre.name}
                            <button
                              type="button"
                              className="remove-genre-btn"
                              onClick={() => handleGenreToggle(genre.id)}
                              aria-label={`Remove ${genre.name}`}
                            >
                              ×
                            </button>
                          </span>
                        ) : null;
                      }).filter(Boolean)}
                    </div>
                  </div>
                )}
                <small className="genre-hint">Hold Ctrl (Windows) or Cmd (Mac) to select multiple genres</small>
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
                <h3>
                  <Link to={`/movies/${movie.id}`}>{movie.title}</Link>
                </h3>
                {movie.year && <p className="year">{movie.year}</p>}
                {movie.director && <p className="director">Director: {movie.director}</p>}
                {movie.genres && movie.genres.length > 0 && (
                  <p className="genre">
                    {movie.genres.length > 1 ? 'Genres' : 'Genre'}: {formatGenres(movie.genres)}
                  </p>
                )}
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

