-- Migration script to add cast and screenwriters tables
-- Run this if you already have the database set up and need to add these tables

-- Create cast_table (actors/actresses)
CREATE TABLE IF NOT EXISTS cast_table (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    bio TEXT,
    profile_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create movie_cast junction table (many-to-many: movies to cast members)
CREATE TABLE IF NOT EXISTS movie_cast (
    id SERIAL PRIMARY KEY,
    movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    cast_id INTEGER NOT NULL REFERENCES cast_table(id) ON DELETE CASCADE,
    character_name VARCHAR(255), -- The character/role name in the movie
    cast_order INTEGER DEFAULT 0, -- Order for display (0 = lead, higher = supporting)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(movie_id, cast_id) -- Prevent duplicate cast entries for same movie
);

-- Create screenwriters table
CREATE TABLE IF NOT EXISTS screenwriters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create movie_screenwriters junction table (many-to-many: movies to screenwriters)
CREATE TABLE IF NOT EXISTS movie_screenwriters (
    id SERIAL PRIMARY KEY,
    movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    screenwriter_id INTEGER NOT NULL REFERENCES screenwriters(id) ON DELETE CASCADE,
    screenwriter_order INTEGER DEFAULT 0, -- Order for display
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(movie_id, screenwriter_id) -- Prevent duplicate screenwriter entries
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_movie_cast_movie_id ON movie_cast(movie_id);
CREATE INDEX IF NOT EXISTS idx_movie_cast_cast_id ON movie_cast(cast_id);
CREATE INDEX IF NOT EXISTS idx_cast_table_name ON cast_table(name);
CREATE INDEX IF NOT EXISTS idx_movie_screenwriters_movie_id ON movie_screenwriters(movie_id);
CREATE INDEX IF NOT EXISTS idx_movie_screenwriters_screenwriter_id ON movie_screenwriters(screenwriter_id);
CREATE INDEX IF NOT EXISTS idx_screenwriters_name ON screenwriters(name);

