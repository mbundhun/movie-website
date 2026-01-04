import React, { useState } from 'react';
import './StarRating.css';

const StarRating = ({ value, onChange, label }) => {
  const [hoverValue, setHoverValue] = useState(null);
  const maxStars = 10;

  const handleStarClick = (starValue) => {
    if (onChange) {
      onChange(starValue);
    }
  };

  const handleMouseLeave = () => {
    setHoverValue(null);
  };

  const renderStar = (starIndex) => {
    const fullStarValue = starIndex + 1;
    const halfStarValue = starIndex + 0.5;
    const displayValue = hoverValue !== null ? hoverValue : (value || 0);
    
    const isFullStar = displayValue >= fullStarValue;
    const isHalfStar = displayValue >= halfStarValue && displayValue < fullStarValue;

    return (
      <div key={starIndex} className="star-container">
        <div
          className={`star-half star-left ${isHalfStar || isFullStar ? 'filled' : ''}`}
          onClick={() => handleStarClick(halfStarValue)}
          onMouseEnter={() => setHoverValue(halfStarValue)}
          onMouseLeave={handleMouseLeave}
        >
          <span className="star-icon">★</span>
        </div>
        <div
          className={`star-half star-right ${isFullStar ? 'filled' : ''}`}
          onClick={() => handleStarClick(fullStarValue)}
          onMouseEnter={() => setHoverValue(fullStarValue)}
          onMouseLeave={handleMouseLeave}
        >
          <span className="star-icon">★</span>
        </div>
      </div>
    );
  };

  return (
    <div className="star-rating-container">
      {label && <label className="star-rating-label">{label}</label>}
      <div className="star-rating" onMouseLeave={handleMouseLeave}>
        {Array.from({ length: maxStars }, (_, i) => renderStar(i))}
        {value > 0 && (
          <span className="star-rating-value">{value}/10</span>
        )}
      </div>
    </div>
  );
};

export default StarRating;

