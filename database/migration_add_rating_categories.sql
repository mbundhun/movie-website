-- Add three new rating columns to reviews table
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS performance_rating INTEGER CHECK (performance_rating >= 1 AND performance_rating <= 10),
ADD COLUMN IF NOT EXISTS directing_rating INTEGER CHECK (directing_rating >= 1 AND directing_rating <= 10),
ADD COLUMN IF NOT EXISTS screenplay_rating INTEGER CHECK (screenplay_rating >= 1 AND screenplay_rating <= 10);

-- For existing reviews, calculate the three ratings from the old rating column
-- We'll set all three to the same value as the old rating for backward compatibility
UPDATE reviews 
SET performance_rating = rating,
    directing_rating = rating,
    screenplay_rating = rating
WHERE rating IS NOT NULL 
  AND (performance_rating IS NULL OR directing_rating IS NULL OR screenplay_rating IS NULL);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reviews_performance_rating ON reviews(performance_rating);
CREATE INDEX IF NOT EXISTS idx_reviews_directing_rating ON reviews(directing_rating);
CREATE INDEX IF NOT EXISTS idx_reviews_screenplay_rating ON reviews(screenplay_rating);

