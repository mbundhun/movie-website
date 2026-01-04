import React, { useState } from 'react';
import api from '../services/api';
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
    if (!formData.performance_rating || formData.performance_rating < 1 || formData.performance_rating > 10) {
      setError('Performance rating must be between 1 and 10');
      return;
    }
    
    if (!formData.directing_rating || formData.directing_rating < 1 || formData.directing_rating > 10) {
      setError('Directing rating must be between 1 and 10');
      return;
    }
    
    if (!formData.screenplay_rating || formData.screenplay_rating < 1 || formData.screenplay_rating > 10) {
      setError('Screenplay rating must be between 1 and 10');
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
        performance_rating: parseInt(formData.performance_rating),
        directing_rating: parseInt(formData.directing_rating),
        screenplay_rating: parseInt(formData.screenplay_rating),
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
          <div className="form-group">
            <label>Performance Rating (1-10) *</label>
            <input
              type="number"
              name="performance_rating"
              min="1"
              max="10"
              value={formData.performance_rating}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Directing Rating (1-10) *</label>
            <input
              type="number"
              name="directing_rating"
              min="1"
              max="10"
              value={formData.directing_rating}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Screenplay Rating (1-10) *</label>
            <input
              type="number"
              name="screenplay_rating"
              min="1"
              max="10"
              value={formData.screenplay_rating}
              onChange={handleChange}
              required
            />
          </div>
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

