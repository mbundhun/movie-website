-- Update rating columns to accept decimal values (for half-star ratings)
ALTER TABLE reviews 
ALTER COLUMN performance_rating TYPE NUMERIC(3,1),
ALTER COLUMN directing_rating TYPE NUMERIC(3,1),
ALTER COLUMN screenplay_rating TYPE NUMERIC(3,1);

-- Update the check constraints to allow 0.5 increments
ALTER TABLE reviews 
DROP CONSTRAINT IF EXISTS reviews_performance_rating_check,
DROP CONSTRAINT IF EXISTS reviews_directing_rating_check,
DROP CONSTRAINT IF EXISTS reviews_screenplay_rating_check;

ALTER TABLE reviews 
ADD CONSTRAINT reviews_performance_rating_check 
  CHECK (performance_rating >= 0.5 AND performance_rating <= 10 AND (performance_rating * 2)::INTEGER = performance_rating * 2),
ADD CONSTRAINT reviews_directing_rating_check 
  CHECK (directing_rating >= 0.5 AND directing_rating <= 10 AND (directing_rating * 2)::INTEGER = directing_rating * 2),
ADD CONSTRAINT reviews_screenplay_rating_check 
  CHECK (screenplay_rating >= 0.5 AND screenplay_rating <= 10 AND (screenplay_rating * 2)::INTEGER = screenplay_rating * 2);

