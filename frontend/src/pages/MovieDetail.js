import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AddReviewModal from '../components/AddReviewModal';
import './MovieDetail.css';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authenticated } = useAuth();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddReview, setShowAddReview] = useState(false);
  const [expandedCast, setExpandedCast] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState({});

  const fetchMovieDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/movies/${id}?include_genres=true&include_cast=true&include_screenwriters=true`);
      setMovie(response.data);
    } catch (error) {
      console.error('Error fetching movie:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await api.get(`/reviews?movie_id=${id}`);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }, [id]);

  useEffect(() => {
    fetchMovieDetails();
    fetchReviews();
  }, [fetchMovieDetails, fetchReviews]);

  const handleAddToWatchlist = async () => {
    if (!authenticated) {
      navigate('/login');
      return;
    }

    try {
      await api.post('/watchlist', { movie_id: id });
      alert('Added to watchlist!');
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      alert(error.response?.data?.message || 'Failed to add to watchlist');
    }
  };

  const handleReviewSuccess = () => {
    fetchReviews();
    fetchMovieDetails(); // Refresh to update average rating
    setShowAddReview(false);
  };

  const toggleReviewExpansion = (reviewId) => {
    setExpandedReviews(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) {
    return <div className="loading">Loading movie details...</div>;
  }

  if (!movie) {
    return (
      <div className="error-state">
        <h2>Movie not found</h2>
        <Link to="/movies" className="btn btn-primary">Back to Movies</Link>
      </div>
    );
  }

  const averageRating = calculateAverageRating();
  const displayedCast = expandedCast ? movie.cast || [] : (movie.cast || []).slice(0, 6);

  return (
    <div className="movie-detail-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="movie-header">
        <div className="movie-poster-section">
          {movie.poster_url ? (
            <img src={movie.poster_url} alt={movie.title} className="movie-poster-large" />
          ) : (
            <div className="poster-placeholder">No Poster</div>
          )}
        </div>

        <div className="movie-info-section">
          <h1>{movie.title} {movie.year && `(${movie.year})`}</h1>
          
          {movie.director && (
            <p className="director-info">
              <strong>Director:</strong> {movie.director}
            </p>
          )}

          {movie.genres && movie.genres.length > 0 && (
            <div className="genres-section">
              <strong>Genres:</strong>
              <div className="genre-tags">
                {movie.genres.map(genre => (
                  <span key={genre.id} className="genre-tag">{genre.name}</span>
                ))}
              </div>
            </div>
          )}

          <div className="rating-section">
            <div className="average-rating">
              <span className="rating-value">{averageRating}</span>
              <span className="rating-out-of">/10</span>
              <div className="rating-stars">
                {'★'.repeat(Math.round(averageRating))}{'☆'.repeat(10 - Math.round(averageRating))}
              </div>
            </div>
            <p className="review-count">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</p>
          </div>

          <div className="quick-actions">
            {authenticated && (
              <>
                <button className="btn btn-primary" onClick={() => setShowAddReview(true)}>
                  Write Review
                </button>
                <button className="btn btn-secondary" onClick={handleAddToWatchlist}>
                  Add to Watchlist
                </button>
              </>
            )}
            {!authenticated && (
              <button className="btn btn-primary" onClick={() => navigate('/login')}>
                Login to Review
              </button>
            )}
          </div>
        </div>
      </div>

      {movie.cast && movie.cast.length > 0 && (
        <section className="cast-section">
          <h2>Cast</h2>
          <div className="cast-grid">
            {displayedCast.map((castMember, index) => (
              <div key={index} className="cast-member">
                {castMember.profile_image_url && (
                  <img src={castMember.profile_image_url} alt={castMember.name} className="cast-photo" />
                )}
                <div className="cast-info">
                  <h4>{castMember.name}</h4>
                  {castMember.character_name && (
                    <p className="character-name">as {castMember.character_name}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {movie.cast.length > 6 && (
            <button 
              className="expand-button"
              onClick={() => setExpandedCast(!expandedCast)}
            >
              {expandedCast ? 'Show Less' : `Show All (${movie.cast.length})`}
            </button>
          )}
        </section>
      )}

      {movie.screenwriters && movie.screenwriters.length > 0 && (
        <section className="screenwriters-section">
          <h2>Screenwriters</h2>
          <div className="screenwriters-list">
            {movie.screenwriters.map((screenwriter, index) => (
              <div key={index} className="screenwriter-item">
                <span>{screenwriter.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="reviews-section">
        <h2>Reviews ({reviews.length})</h2>
        {reviews.length > 0 ? (
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <div className="review-rating">
                    {'★'.repeat(review.rating)}{'☆'.repeat(10 - review.rating)}
                    <span className="rating-number">{review.rating}/10</span>
                  </div>
                  {review.user_username && (
                    <span className="review-author">by {review.user_username}</span>
                  )}
                  {review.watched_date && (
                    <span className="watched-date">
                      Watched: {new Date(review.watched_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {review.review_text && (
                  <div className="review-text">
                    {expandedReviews[review.id] || review.review_text.length <= 200 ? (
                      <p>{review.review_text}</p>
                    ) : (
                      <>
                        <p>{review.review_text.substring(0, 200)}...</p>
                        <button 
                          className="expand-text-button"
                          onClick={() => toggleReviewExpansion(review.id)}
                        >
                          Read More
                        </button>
                      </>
                    )}
                    {expandedReviews[review.id] && review.review_text.length > 200 && (
                      <button 
                        className="expand-text-button"
                        onClick={() => toggleReviewExpansion(review.id)}
                      >
                        Show Less
                      </button>
                    )}
                  </div>
                )}
                {review.tags && review.tags.length > 0 && (
                  <div className="review-tags">
                    {review.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No reviews yet. Be the first to review this movie!</p>
            {authenticated && (
              <button className="btn btn-primary" onClick={() => setShowAddReview(true)}>
                Write First Review
              </button>
            )}
          </div>
        )}
      </section>

      {showAddReview && (
        <AddReviewModal
          movie={{ id: parseInt(id), title: movie.title }}
          onClose={() => setShowAddReview(false)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
};

export default MovieDetail;

