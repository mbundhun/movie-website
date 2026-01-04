import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AddReviewModal from '../components/AddReviewModal';
import './MovieDetail.css';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authenticated, user } = useAuth();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddReview, setShowAddReview] = useState(false);
  const [expandedCast, setExpandedCast] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState({});
  const [reviewPage, setReviewPage] = useState(1);
  const reviewsPerPage = 5;

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

  const fetchRelatedMovies = useCallback(async () => {
    if (!movie) return;
    
    try {
      let queryParams = new URLSearchParams();
      queryParams.append('limit', '6');
      queryParams.append('include_genres', 'true');
      
      // Get movies with same genres
      if (movie.genres && movie.genres.length > 0) {
        movie.genres.forEach(genre => {
          queryParams.append('genre_ids', genre.id);
        });
      }
      
      // Exclude current movie
      const response = await api.get(`/movies?${queryParams.toString()}`);
      const related = (response.data.movies || []).filter(m => m.id !== parseInt(id)).slice(0, 6);
      setRelatedMovies(related);
    } catch (error) {
      console.error('Error fetching related movies:', error);
    }
  }, [movie, id]);

  useEffect(() => {
    if (movie) {
      fetchRelatedMovies();
    }
  }, [movie, fetchRelatedMovies]);

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

  const handleMarkAsWatched = async () => {
    if (!authenticated) {
      navigate('/login');
      return;
    }

    try {
      // Check if user already has a review for this movie
      const existingReview = reviews.find(r => r.user_id === user?.id);
      if (existingReview) {
        // Update existing review with today's date if watched_date is not set
        if (!existingReview.watched_date) {
          const today = new Date().toISOString().split('T')[0];
          await api.put(`/reviews/${existingReview.id}`, {
            watched_date: today
          });
          alert('Movie marked as watched!');
          fetchReviews();
        } else {
          alert('This movie is already marked as watched.');
        }
        return;
      }

      // Create a minimal review with today's date and default rating of 5
      const today = new Date().toISOString().split('T')[0];
      await api.post('/reviews', {
        movie_id: id,
        rating: 5, // Default neutral rating
        watched_date: today
      });
      
      alert('Movie marked as watched!');
      fetchReviews();
      fetchMovieDetails(); // Refresh to update average rating
    } catch (error) {
      console.error('Error marking as watched:', error);
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already reviewed')) {
        // User already has a review, try to update it
        const userReview = reviews.find(r => r.user_id === user?.id);
        if (userReview && !userReview.watched_date) {
          const today = new Date().toISOString().split('T')[0];
          try {
            await api.put(`/reviews/${userReview.id}`, {
              watched_date: today
            });
            alert('Movie marked as watched!');
            fetchReviews();
          } catch (updateError) {
            alert('Failed to mark as watched. Please try again.');
          }
        } else {
          alert('You have already reviewed this movie.');
        }
      } else {
        alert(error.response?.data?.message || 'Failed to mark as watched');
      }
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
            <img 
              src={movie.poster_url} 
              alt={movie.title} 
              className="movie-poster-large"
              loading="eager"
            />
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
                {user?.is_admin === true && (
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => navigate(`/movies/${id}/edit`)}
                  >
                    Edit Movie
                  </button>
                )}
                <button className="btn btn-primary" onClick={() => setShowAddReview(true)}>
                  Write Review
                </button>
                <button className="btn btn-secondary" onClick={handleMarkAsWatched}>
                  Mark as Watched
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
                  <img 
                    src={castMember.profile_image_url} 
                    alt={castMember.name} 
                    className="cast-photo"
                    loading="lazy"
                  />
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

      {relatedMovies.length > 0 && (
        <section className="related-movies-section">
          <h2>Related Movies</h2>
          <div className="related-movies-grid">
            {relatedMovies.map((relatedMovie) => (
              <Link key={relatedMovie.id} to={`/movies/${relatedMovie.id}`} className="related-movie-card">
                {relatedMovie.poster_url && (
                  <img 
                    src={relatedMovie.poster_url} 
                    alt={relatedMovie.title} 
                    className="related-movie-poster"
                    loading="lazy"
                  />
                )}
                <div className="related-movie-info">
                  <h4>{relatedMovie.title}</h4>
                  {relatedMovie.year && <p className="related-movie-year">{relatedMovie.year}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="reviews-section">
        <h2>Reviews ({reviews.length})</h2>
        {reviews.length > 0 ? (
          <>
            <div className="reviews-list">
              {reviews.slice((reviewPage - 1) * reviewsPerPage, reviewPage * reviewsPerPage).map((review) => (
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
            {reviews.length > reviewsPerPage && (
              <div className="reviews-pagination">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setReviewPage(prev => Math.max(1, prev - 1))}
                  disabled={reviewPage === 1}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {reviewPage} of {Math.ceil(reviews.length / reviewsPerPage)}
                </span>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setReviewPage(prev => Math.min(Math.ceil(reviews.length / reviewsPerPage), prev + 1))}
                  disabled={reviewPage >= Math.ceil(reviews.length / reviewsPerPage)}
                >
                  Next
                </button>
              </div>
            )}
          </>
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
          initialWatchedDate={new Date().toISOString().split('T')[0]}
        />
      )}
    </div>
  );
};

export default MovieDetail;

