import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AddReviewModal from '../components/AddReviewModal';
import './Reviews.css';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { authenticated } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    rating_min: searchParams.get('rating_min') || '',
    rating_max: searchParams.get('rating_max') || '',
    tag: searchParams.get('tag') || ''
  });

  useEffect(() => {
    fetchReviews();
    fetchMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchParams.get('movie_id')) params.movie_id = searchParams.get('movie_id');
      if (searchParams.get('search')) params.search = searchParams.get('search');
      if (searchParams.get('rating_min')) params.rating_min = searchParams.get('rating_min');
      if (searchParams.get('rating_max')) params.rating_max = searchParams.get('rating_max');
      if (searchParams.get('tag')) params.tag = searchParams.get('tag');

      const response = await api.get('/reviews', { params });
      setReviews(response.data.reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovies = async () => {
    try {
      const response = await api.get('/movies');
      setMovies(response.data.movies);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const handleAddReview = () => {
    if (!authenticated) {
      alert('Please login to add a review');
      return;
    }
    setShowAddModal(true);
  };

  const handleReviewSuccess = () => {
    fetchReviews();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const applyFilters = () => {
    const newParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) newParams.set(key, value);
    });
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({ search: '', rating_min: '', rating_max: '', tag: '' });
    setSearchParams({});
  };

  if (loading) {
    return <div className="loading">Loading reviews...</div>;
  }

  return (
    <div className="reviews-page">
      <h1>Movie Reviews</h1>

      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            name="search"
            placeholder="Search by movie title..."
            value={filters.search}
            onChange={handleFilterChange}
            onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
          />
        </div>
        <div className="filter-group">
          <input
            type="number"
            name="rating_min"
            placeholder="Min rating (1-10)"
            min="1"
            max="10"
            value={filters.rating_min}
            onChange={handleFilterChange}
          />
          <span>to</span>
          <input
            type="number"
            name="rating_max"
            placeholder="Max rating (1-10)"
            min="1"
            max="10"
            value={filters.rating_max}
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-group">
          <input
            type="text"
            name="tag"
            placeholder="Filter by tag..."
            value={filters.tag}
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-actions">
          <button className="btn btn-primary" onClick={applyFilters}>
            Apply Filters
          </button>
          <button className="btn btn-secondary" onClick={clearFilters}>
            Clear
          </button>
        </div>
      </div>

      <div className="reviews-actions">
        {authenticated ? (
          <div className="add-review-section">
            <select
              value={selectedMovie?.id || ''}
              onChange={(e) => {
                const movie = movies.find(m => m.id === parseInt(e.target.value));
                setSelectedMovie(movie || null);
              }}
              className="movie-select"
            >
              <option value="">Select a movie to review...</option>
              {movies.map(movie => (
                <option key={movie.id} value={movie.id}>
                  {movie.title} {movie.year ? `(${movie.year})` : ''}
                </option>
              ))}
            </select>
            <button
              className="btn btn-primary"
              onClick={handleAddReview}
              disabled={!selectedMovie}
            >
              Add Review
            </button>
          </div>
        ) : (
          <div className="info-banner">
            <p>You're viewing as a visitor. <a href="/login">Login</a> to write your own reviews!</p>
          </div>
        )}
      </div>

      {showAddModal && selectedMovie && (
        <AddReviewModal
          movie={selectedMovie}
          onClose={() => {
            setShowAddModal(false);
            setSelectedMovie(null);
          }}
          onSuccess={handleReviewSuccess}
        />
      )}

      {reviews.length > 0 ? (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review.id} className="review-item">
              <div className="review-header">
                <h3>{review.movie_title} ({review.movie_year})</h3>
                <div className="rating">
                  {'★'.repeat(review.rating)}{'☆'.repeat(10 - review.rating)}
                  <span className="rating-number"> {review.rating}/10</span>
                </div>
              </div>
              {review.review_text && (
                <p className="review-text">{review.review_text}</p>
              )}
              {review.tags && review.tags.length > 0 && (
                <div className="tags">
                  {review.tags.map((tag, idx) => (
                    <span key={idx} className="tag">{tag}</span>
                  ))}
                </div>
              )}
              <div className="review-meta">
                {review.user_username && (
                  <span>By {review.user_username}</span>
                )}
                {review.watched_date && (
                  <span>Watched: {new Date(review.watched_date).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No reviews found</h3>
          <p>Try adjusting your filters or be the first to add a review!</p>
        </div>
      )}
    </div>
  );
};

export default Reviews;

