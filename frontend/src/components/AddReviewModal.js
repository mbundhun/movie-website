import React, { useState } from 'react';
import api from '../services/api';
import './AddReviewModal.css';

const AddReviewModal = ({ movie, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    rating: '',
    review_text: '',
    watched_date: '',
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

    if (!formData.rating || formData.rating < 1 || formData.rating > 10) {
      setError('Rating must be between 1 and 10');
      return;
    }

    setLoading(true);

    try {
      const tagsArray = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];

      await api.post('/reviews', {
        movie_id: movie.id,
        rating: parseInt(formData.rating),
        review_text: formData.review_text || null,
        watched_date: formData.watched_date || null,
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
            <label>Rating (1-10) *</label>
            <input
              type="number"
              name="rating"
              min="1"
              max="10"
              value={formData.rating}
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

