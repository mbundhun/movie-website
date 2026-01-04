import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import './AdvancedFilters.css';

const AdvancedFilters = ({ onFilterChange, currentFilters = {} }) => {
  const [genres, setGenres] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    genres: currentFilters.genres || [],
    yearMin: currentFilters.yearMin || '',
    yearMax: currentFilters.yearMax || '',
    ratingMin: currentFilters.ratingMin || '',
    ratingMax: currentFilters.ratingMax || '',
    director: currentFilters.director || '',
    hasReviews: currentFilters.hasReviews || '',
    inWatchlist: currentFilters.inWatchlist || '',
    sortBy: currentFilters.sortBy || 'title',
    sortOrder: currentFilters.sortOrder || 'asc'
  });

  const fetchGenres = useCallback(async () => {
    try {
      const response = await api.get('/genres');
      setGenres(response.data.genres || []);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  }, []);

  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleGenreToggle = (genreId) => {
    const genreIds = filters.genres.includes(genreId)
      ? filters.genres.filter(id => id !== genreId)
      : [...filters.genres, genreId];
    handleFilterChange('genres', genreIds);
  };

  const clearFilters = () => {
    const clearedFilters = {
      genres: [],
      yearMin: '',
      yearMax: '',
      ratingMin: '',
      ratingMax: '',
      director: '',
      hasReviews: '',
      inWatchlist: '',
      sortBy: 'title',
      sortOrder: 'asc'
    };
    setFilters(clearedFilters);
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
  };

  const activeFilterCount = 
    filters.genres.length +
    (filters.yearMin ? 1 : 0) +
    (filters.yearMax ? 1 : 0) +
    (filters.ratingMin ? 1 : 0) +
    (filters.ratingMax ? 1 : 0) +
    (filters.director ? 1 : 0) +
    (filters.hasReviews ? 1 : 0) +
    (filters.inWatchlist ? 1 : 0) +
    (filters.sortBy !== 'title' || filters.sortOrder !== 'asc' ? 1 : 0);

  return (
    <div className="advanced-filters">
      <button
        className="filter-toggle-btn"
        onClick={() => setShowFilters(!showFilters)}
      >
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="filter-badge">{activeFilterCount}</span>
        )}
        <span className="toggle-icon">{showFilters ? '▲' : '▼'}</span>
      </button>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-header">
            <h3>Filter Movies</h3>
            {activeFilterCount > 0 && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                Clear All
              </button>
            )}
          </div>

          <div className="filters-content">
            <div className="filter-group">
              <label>Genres</label>
              <div className="genre-checkboxes">
                {genres.map(genre => (
                  <label key={genre.id} className="genre-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.genres.includes(genre.id)}
                      onChange={() => handleGenreToggle(genre.id)}
                    />
                    <span>{genre.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-row">
              <div className="filter-group">
                <label>Year Range</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.yearMin}
                    onChange={(e) => handleFilterChange('yearMin', e.target.value)}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.yearMax}
                    onChange={(e) => handleFilterChange('yearMax', e.target.value)}
                  />
                </div>
              </div>

              <div className="filter-group">
                <label>Rating Range</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    placeholder="Min"
                    value={filters.ratingMin}
                    onChange={(e) => handleFilterChange('ratingMin', e.target.value)}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    placeholder="Max"
                    value={filters.ratingMax}
                    onChange={(e) => handleFilterChange('ratingMax', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="filter-group">
              <label>Director</label>
              <input
                type="text"
                placeholder="Search by director"
                value={filters.director}
                onChange={(e) => handleFilterChange('director', e.target.value)}
              />
            </div>

            <div className="filter-row">
              <div className="filter-group">
                <label>Has Reviews</label>
                <select
                  value={filters.hasReviews}
                  onChange={(e) => handleFilterChange('hasReviews', e.target.value)}
                >
                  <option value="">Any</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>

              <div className="filter-group">
                <label>In Watchlist</label>
                <select
                  value={filters.inWatchlist}
                  onChange={(e) => handleFilterChange('inWatchlist', e.target.value)}
                >
                  <option value="">Any</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>

            <div className="filter-row">
              <div className="filter-group">
                <label>Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <option value="title">Title</option>
                  <option value="year">Year</option>
                  <option value="rating">Rating</option>
                  <option value="created_at">Recently Added</option>
                  <option value="review_count">Most Reviewed</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Order</label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeFilterCount > 0 && (
        <div className="active-filters">
          {filters.genres.map(genreId => {
            const genre = genres.find(g => g.id === genreId);
            return genre ? (
              <span key={genreId} className="filter-chip">
                {genre.name}
                <button onClick={() => handleGenreToggle(genreId)}>×</button>
              </span>
            ) : null;
          })}
          {filters.yearMin && (
            <span className="filter-chip">
              Year ≥ {filters.yearMin}
              <button onClick={() => handleFilterChange('yearMin', '')}>×</button>
            </span>
          )}
          {filters.yearMax && (
            <span className="filter-chip">
              Year ≤ {filters.yearMax}
              <button onClick={() => handleFilterChange('yearMax', '')}>×</button>
            </span>
          )}
          {filters.ratingMin && (
            <span className="filter-chip">
              Rating ≥ {filters.ratingMin}
              <button onClick={() => handleFilterChange('ratingMin', '')}>×</button>
            </span>
          )}
          {filters.ratingMax && (
            <span className="filter-chip">
              Rating ≤ {filters.ratingMax}
              <button onClick={() => handleFilterChange('ratingMax', '')}>×</button>
            </span>
          )}
          {filters.director && (
            <span className="filter-chip">
              Director: {filters.director}
              <button onClick={() => handleFilterChange('director', '')}>×</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;

