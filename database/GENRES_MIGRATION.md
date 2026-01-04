# Genres Database Migration Guide

## Overview
This migration adds a proper genres table and many-to-many relationship between movies and genres, replacing the single `genre` text field in the movies table.

## Migration Steps

### 1. Run the Migration SQL
Execute the migration script in your Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Click "New query"
3. Copy and paste the contents of `database/migration_add_genres.sql`
4. Click "Run"

This will:
- Create `genres` table
- Create `movie_genres` junction table
- Insert default genres (Action, Adventure, Animation, etc.)
- Create necessary indexes

### 2. Migrate Existing Data (Optional)
If you have existing movies with genres in the old `genre` field, you can migrate them:

```sql
-- This will parse comma-separated genres from the old genre field
-- and create genre associations in the new movie_genres table
DO $$
DECLARE
    movie_record RECORD;
    genre_name TEXT;
    genre_id_val INTEGER;
    genre_array TEXT[];
BEGIN
    FOR movie_record IN SELECT id, genre FROM movies WHERE genre IS NOT NULL AND genre != '' LOOP
        -- Split comma-separated genres
        genre_array := string_to_array(movie_record.genre, ',');
        
        FOREACH genre_name IN ARRAY genre_array LOOP
            genre_name := trim(genre_name);
            
            -- Get or create genre
            SELECT id INTO genre_id_val FROM genres WHERE name = genre_name;
            
            IF genre_id_val IS NULL THEN
                INSERT INTO genres (name) VALUES (genre_name) RETURNING id INTO genre_id_val;
            END IF;
            
            -- Link movie to genre (ignore duplicates)
            INSERT INTO movie_genres (movie_id, genre_id)
            VALUES (movie_record.id, genre_id_val)
            ON CONFLICT (movie_id, genre_id) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;
```

### 3. Verify Migration
Check that genres were created and linked:

```sql
-- Check genres count
SELECT COUNT(*) FROM genres;

-- Check movie-genre associations
SELECT COUNT(*) FROM movie_genres;

-- View sample movie with genres
SELECT m.title, array_agg(g.name) as genres
FROM movies m
LEFT JOIN movie_genres mg ON m.id = mg.movie_id
LEFT JOIN genres g ON mg.genre_id = g.id
GROUP BY m.id, m.title
LIMIT 10;
```

## Database Schema

### genres table
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR(50) UNIQUE NOT NULL)
- `created_at` (TIMESTAMP)

### movie_genres table (junction table)
- `id` (SERIAL PRIMARY KEY)
- `movie_id` (INTEGER, references movies.id)
- `genre_id` (INTEGER, references genres.id)
- `created_at` (TIMESTAMP)
- UNIQUE constraint on (movie_id, genre_id)

## API Changes

### New Endpoint: `/api/genres`
- `GET /api/genres` - Get all genres
- `GET /api/genres/:id` - Get single genre

### Updated Endpoint: `/api/movies`
- `POST /api/movies` - Now accepts `genres` array instead of `genre` string
- `GET /api/movies?include_genres=true` - Optionally include genres in response
- `PUT /api/movies/:id` - Now accepts `genres` array for updates

## Frontend Changes
- Genres are now fetched from `/api/genres` endpoint
- Form sends `genres` as an array of genre names
- Movie cards display genres from the database relationship

## Notes
- The old `genre` column in the `movies` table is kept for backward compatibility
- New movies will use the `movie_genres` relationship
- You can drop the old `genre` column later if desired (after migrating existing data)

