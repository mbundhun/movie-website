import React from 'react';
import './Skeleton.css';

const Skeleton = ({ type = 'text', width, height, className = '' }) => {
  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div className={`skeleton skeleton-${type} ${className}`} style={style}>
      <div className="skeleton-shimmer"></div>
    </div>
  );
};

export const MovieCardSkeleton = () => (
  <div className="movie-card-skeleton">
    <Skeleton type="image" height="300px" />
    <div className="skeleton-content">
      <Skeleton type="text" width="80%" height="20px" />
      <Skeleton type="text" width="40%" height="16px" />
    </div>
  </div>
);

export const MovieListSkeleton = ({ count = 6 }) => (
  <div className="movies-grid">
    {Array.from({ length: count }).map((_, i) => (
      <MovieCardSkeleton key={i} />
    ))}
  </div>
);

export default Skeleton;

