import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './EditMovie.css';

const EditMovie = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [genres, setGenres] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    year: '',
    director: '',
    poster_url: '',
    imdb_id: ''
  });
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [genreInput, setGenreInput] = useState('');
  const [genreSuggestions, setGenreSuggestions] = useState([]);

  const fetchMovie = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/movies/${id}?include_genres=true`);
      const movie = response.data;
      
      setFormData({
        title: movie.title || '',
        year: movie.year || '',
        director: movie.director || '',
        poster_url: movie.poster_url || '',
        imdb_id: movie.imdb_id || ''
      });
      
      if (movie.genres) {
        setSelectedGenres(movie.genres.map(g => g.id));
      }
    } catch (error) {
      console.error('Error fetching movie:', error);
      setError('Failed to load movie');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchGenres = useCallback(async () => {
    try {
      const response = await api.get('/genres');
      setGenres(response.data.genres || []);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  }, []);

  useEffect(() => {
    if (!authenticated || !user?.is_admin) {
      navigate('/movies');
      return;
    }
    fetchMovie();
    fetchGenres();
  }, [authenticated, user, navigate, fetchMovie, fetchGenres]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGenreInputChange = (e) => {
    const value = e.target.value;
    setGenreInput(value);
    
    if (value.trim()) {
      const filtered = genres.filter(genre =>
        genre.name.toLowerCase().includes(value.toLowerCase()) &&
        !selectedGenres.includes(genre.id)
      );
      setGenreSuggestions(filtered.slice(0, 5));
    } else {
      setGenreSuggestions([]);
    }
  };

  const handleAddGenre = (genreId) => {
    if (!selectedGenres.includes(genreId)) {
      setSelectedGenres(prev => [...prev, genreId]);
      setGenreInput('');
      setGenreSuggestions([]);
    }
  };

  const handleRemoveGenre = (genreId) => {
    setSelectedGenres(prev => prev.filter(id => id !== genreId));
  };

  const handleGenreKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmedInput = genreInput.trim();
      if (trimmedInput) {
        const genre = genres.find(g => g.name.toLowerCase() === trimmedInput.toLowerCase());
        if (genre && !selectedGenres.includes(genre.id)) {
          handleAddGenre(genre.id);
        } else if (!genre) {
          // New genre - will be created by backend
          setGenreInput('');
          setGenreSuggestions([]);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const genreNames = selectedGenres.map(id => {
        const genre = genres.find(g => g.id === id);
        return genre ? genre.name : null;
      }).filter(Boolean);

      await api.put(`/movies/${id}`, {
        ...formData,
        year: formData.year ? parseInt(formData.year) : null,
        genres: genreNames
      });

      navigate(`/movies/${id}`);
    } catch (error) {
      console.error('Error updating movie:', error);
      setError(error.response?.data?.message || 'Failed to update movie');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading movie...</div>;
  }

  if (!authenticated || !user?.is_admin) {
    return null;
  }

  return (
    <div className="edit-movie-page">
      <div className="page-header">
        <h1>Edit Movie</h1>
        <button className="btn btn-secondary" onClick={() => navigate(`/movies/${id}`)}>
          Cancel
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="edit-movie-form">
        <div className="form-row">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Year</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Director</label>
          <input
            type="text"
            name="director"
            value={formData.director}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Genres</label>
          <div className="genre-input-container">
            <input
              type="text"
              className="genre-input"
              placeholder="Type genre and press Enter or comma"
              value={genreInput}
              onChange={handleGenreInputChange}
              onKeyPress={handleGenreKeyPress}
            />
            {genreSuggestions.length > 0 && (
              <div className="genre-suggestions">
                {genreSuggestions.map(genre => (
                  <div
                    key={genre.id}
                    className="genre-suggestion-item"
                    onClick={() => handleAddGenre(genre.id)}
                  >
                    {genre.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          {selectedGenres.length > 0 && (
            <div className="selected-genres-display">
              <div className="selected-genres-tags">
                {selectedGenres.map(genreId => {
                  const genre = genres.find(g => g.id === genreId);
                  return genre ? (
                    <span key={genreId} className="genre-tag">
                      {genre.name}
                      <button
                        type="button"
                        className="remove-genre-btn"
                        onClick={() => handleRemoveGenre(genreId)}
                        aria-label={`Remove ${genre.name}`}
                      >
                        ×
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Poster URL</label>
          <input
            type="url"
            name="poster_url"
            value={formData.poster_url}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>IMDB ID</label>
          <input
            type="text"
            name="imdb_id"
            value={formData.imdb_id}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate(`/movies/${id}`)}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMovie;

