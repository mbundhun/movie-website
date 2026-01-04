import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useDebounce from '../hooks/useDebounce';
import './SearchBar.css';

const SearchBar = ({ onSearch, placeholder = "Search movies..." }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearchTerm.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await api.get(`/movies?search=${encodeURIComponent(debouncedSearchTerm)}&limit=5`);
        setSuggestions(response.data.movies || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchTerm]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (movie) => {
    setSearchTerm(movie.title);
    setShowSuggestions(false);
    navigate(`/movies/${movie.id}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(searchTerm);
    } else {
      navigate(`/movies?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="search-bar-container" ref={searchRef}>
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
        />
        <button type="submit" className="search-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>
      </form>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {loading && <div className="suggestion-item loading">Loading...</div>}
          {!loading && suggestions.map((movie) => (
            <div
              key={movie.id}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(movie)}
            >
              <div className="suggestion-title">{movie.title}</div>
              {movie.year && <div className="suggestion-meta">{movie.year}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;

