import React, { useState } from 'react';
import api from '../services/api';
import StarRating from './StarRating';
import './AddReviewModal.css';

const AddReviewModal = ({ movie, onClose, onSuccess, initialWatchedDate }) => {
  const [formData, setFormData] = useState({
    performance_rating: '',
    directing_rating: '',
    screenplay_rating: '',
    review_text: '',
    watched_date: initialWatchedDate || '',
    tags: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all three ratings
    if (!formData.performance_rating || formData.performance_rating < 0.5 || formData.performance_rating > 10) {
      setError('Performance rating is required');
      return;
    }
    
    if (!formData.directing_rating || formData.directing_rating < 0.5 || formData.directing_rating > 10) {
      setError('Direction rating is required');
      return;
    }
    
    if (!formData.screenplay_rating || formData.screenplay_rating < 0.5 || formData.screenplay_rating > 10) {
      setError('Screenplay rating is required');
      return;
    }

    setLoading(true);

    try {
      const tagsArray = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];

      // Automatically set watched_date to today if not provided
      const watchedDate = formData.watched_date || new Date().toISOString().split('T')[0];

      await api.post('/reviews', {
        movie_id: movie.id,
        performance_rating: parseFloat(formData.performance_rating),
        directing_rating: parseFloat(formData.directing_rating),
        screenplay_rating: parseFloat(formData.screenplay_rating),
        review_text: formData.review_text || null,
        watched_date: watchedDate,
        tags: tagsArray.length > 0 ? tagsArray : null
      });

      onSuccess();
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Review for {movie.title}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <StarRating
            label="Performance"
            value={formData.performance_rating || 0}
            onChange={(value) => setFormData({ ...formData, performance_rating: value })}
          />
          <StarRating
            label="Direction"
            value={formData.directing_rating || 0}
            onChange={(value) => setFormData({ ...formData, directing_rating: value })}
          />
          <StarRating
            label="Screenplay"
            value={formData.screenplay_rating || 0}
            onChange={(value) => setFormData({ ...formData, screenplay_rating: value })}
          />
          <div className="form-group">
            <label>Review Text</label>
            <textarea
              name="review_text"
              value={formData.review_text}
              onChange={handleChange}
              rows="5"
            />
          </div>
          <div className="form-group">
            <label>Watched Date</label>
            <input
              type="date"
              name="watched_date"
              value={formData.watched_date}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              placeholder="e.g., action, sci-fi, thriller"
              value={formData.tags}
              onChange={handleChange}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReviewModal;

