import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Home.css';

const Home = () => {
  const [recentReviews, setRecentReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reviewsRes, statsRes] = await Promise.all([
        api.get('/reviews?limit=5'),
        api.get('/stats')
      ]);
      
      setRecentReviews(reviewsRes.data.reviews);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home">
      <h1>Welcome to Movie Reviews</h1>
      <p className="subtitle">Discover and review your favorite movies</p>

      {stats && (
        <div className="stats-overview">
          <div className="stat-card">
            <h3>{stats.totalMovies}</h3>
            <p>Total Movies</p>
          </div>
          <div className="stat-card">
            <h3>{stats.totalReviews}</h3>
            <p>Total Reviews</p>
          </div>
          <div className="stat-card">
            <h3>{stats.averageRating}</h3>
            <p>Average Rating</p>
          </div>
        </div>
      )}

      <section className="recent-reviews">
        <h2>Recent Reviews</h2>
        {recentReviews.length > 0 ? (
          <div className="reviews-grid">
            {recentReviews.map((review) => (
              <div key={review.id} className="review-card">
                <h3>
                  <Link to={`/reviews?movie_id=${review.movie_id}`}>
                    {review.movie_title} ({review.movie_year})
                  </Link>
                </h3>
                <div className="rating">
                  {'★'.repeat(review.rating)}{'☆'.repeat(10 - review.rating)}
                  <span className="rating-number"> {review.rating}/10</span>
                </div>
                {review.review_text && (
                  <p className="review-text">{review.review_text.substring(0, 150)}...</p>
                )}
                {review.user_username && (
                  <p className="review-author">By {review.user_username}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No reviews yet. Be the first to add one!</p>
        )}
        <Link to="/reviews" className="btn btn-primary">
          View All Reviews
        </Link>
      </section>
    </div>
  );
};

export default Home;

