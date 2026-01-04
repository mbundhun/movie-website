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

  const handleStarHover = (starValue) => {
    setHoverValue(starValue);
  };

  const handleMouseLeave = () => {
    setHoverValue(null);
  };

  const getStarValue = (starIndex, isHalf) => {
    return starIndex + (isHalf ? 0.5 : 1);
  };

  const renderStar = (starIndex) => {
    const fullStarValue = starIndex + 1;
    const halfStarValue = starIndex + 0.5;
    const displayValue = hoverValue !== null ? hoverValue : value;
    
    const isFullStar = displayValue >= fullStarValue;
    const isHalfStar = displayValue >= halfStarValue && displayValue < fullStarValue;
    const isEmptyStar = displayValue < halfStarValue;

    return (
      <div key={starIndex} className="star-container">
        <div
          className="star-half star-left"
          onClick={() => handleStarClick(halfStarValue)}
          onMouseEnter={() => handleStarHover(halfStarValue)}
          onMouseLeave={handleMouseLeave}
        >
          {isHalfStar || isFullStar ? '★' : '☆'}
        </div>
        <div
          className="star-half star-right"
          onClick={() => handleStarClick(fullStarValue)}
          onMouseEnter={() => handleStarHover(fullStarValue)}
          onMouseLeave={handleMouseLeave}
        >
          {isFullStar ? '★' : '☆'}
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

