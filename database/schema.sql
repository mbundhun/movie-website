-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create movies table
CREATE TABLE IF NOT EXISTS movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    year INTEGER,
    director VARCHAR(255),
    genre VARCHAR(100),
    poster_url TEXT,
    imdb_id VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 10),
    review_text TEXT,
    watched_date DATE,
    tags TEXT[], -- Array of tags
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
    id SERIAL PRIMARY KEY,
    movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    priority INTEGER DEFAULT 0
);

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
CREATE INDEX IF NOT EXISTS idx_reviews_movie_id ON reviews(movie_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_movie_id ON watchlist(movie_id);
CREATE INDEX IF NOT EXISTS idx_movies_title ON movies(title);
CREATE INDEX IF NOT EXISTS idx_movies_year ON movies(year);
CREATE INDEX IF NOT EXISTS idx_movies_genre ON movies(genre);

-- Indexes for cast and screenwriters
CREATE INDEX IF NOT EXISTS idx_movie_cast_movie_id ON movie_cast(movie_id);
CREATE INDEX IF NOT EXISTS idx_movie_cast_cast_id ON movie_cast(cast_id);
CREATE INDEX IF NOT EXISTS idx_cast_table_name ON cast_table(name);
CREATE INDEX IF NOT EXISTS idx_movie_screenwriters_movie_id ON movie_screenwriters(movie_id);
CREATE INDEX IF NOT EXISTS idx_movie_screenwriters_screenwriter_id ON movie_screenwriters(screenwriter_id);
CREATE INDEX IF NOT EXISTS idx_screenwriters_name ON screenwriters(name);

