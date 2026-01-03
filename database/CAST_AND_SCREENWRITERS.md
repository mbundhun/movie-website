# Cast and Screenwriters Database Schema

This document explains the cast and screenwriters tables and how to use them.

## Database Structure

### Tables Created

1. **`cast_table`** - Stores cast member information
2. **`movie_cast`** - Junction table linking movies to cast members (many-to-many)
3. **`screenwriters`** - Stores screenwriter information
4. **`movie_screenwriters`** - Junction table linking movies to screenwriters (many-to-many)

## Table Schemas

### `cast_table` Table
- `id` (SERIAL PRIMARY KEY) - Unique identifier
- `name` (VARCHAR(255) NOT NULL) - Cast member's name
- `bio` (TEXT) - Optional biography
- `profile_image_url` (TEXT) - Optional profile image URL
- `created_at` (TIMESTAMP) - Creation timestamp

### `movie_cast` Junction Table
- `id` (SERIAL PRIMARY KEY) - Unique identifier
- `movie_id` (INTEGER) - References movies(id)
- `cast_id` (INTEGER) - References cast_table(id)
- `character_name` (VARCHAR(255)) - Character/role name in the movie (optional)
- `cast_order` (INTEGER) - Display order (0 = lead, higher = supporting)
- `created_at` (TIMESTAMP) - Creation timestamp
- **UNIQUE constraint** on (movie_id, cast_id) - Prevents duplicate entries

### `screenwriters` Table
- `id` (SERIAL PRIMARY KEY) - Unique identifier
- `name` (VARCHAR(255) NOT NULL) - Screenwriter's name
- `bio` (TEXT) - Optional biography
- `created_at` (TIMESTAMP) - Creation timestamp

### `movie_screenwriters` Junction Table
- `id` (SERIAL PRIMARY KEY) - Unique identifier
- `movie_id` (INTEGER) - References movies(id)
- `screenwriter_id` (INTEGER) - References screenwriters(id)
- `screenwriter_order` (INTEGER) - Display order
- `created_at` (TIMESTAMP) - Creation timestamp
- **UNIQUE constraint** on (movie_id, screenwriter_id) - Prevents duplicate entries

## API Endpoints

### Cast Endpoints

#### Get All Cast Members
```
GET /api/cast
GET /api/cast?search=name
```

#### Get Single Cast Member
```
GET /api/cast/:id
```
Returns cast member info with all movies they've appeared in.

#### Get Cast for a Movie
```
GET /api/cast/movie/:movieId
```

#### Create Cast Member (Authenticated)
```
POST /api/cast
Body: { name, bio?, profile_image_url? }
```

#### Add Cast Member to Movie (Authenticated)
```
POST /api/cast/movie/:movieId
Body: { cast_id, character_name?, cast_order? }
```

#### Remove Cast Member from Movie (Authenticated)
```
DELETE /api/cast/movie/:movieId/:castId
```

### Screenwriters Endpoints

#### Get All Screenwriters
```
GET /api/screenwriters
GET /api/screenwriters?search=name
```

#### Get Single Screenwriter
```
GET /api/screenwriters/:id
```
Returns screenwriter info with all movies they've worked on.

#### Get Screenwriters for a Movie
```
GET /api/screenwriters/movie/:movieId
```

#### Create Screenwriter (Authenticated)
```
POST /api/screenwriters
Body: { name, bio? }
```

#### Add Screenwriter to Movie (Authenticated)
```
POST /api/screenwriters/movie/:movieId
Body: { screenwriter_id, screenwriter_order? }
```

#### Remove Screenwriter from Movie (Authenticated)
```
DELETE /api/screenwriters/movie/:movieId/:screenwriterId
```

### Updated Movie Endpoint

#### Get Movie with Cast and Screenwriters
```
GET /api/movies/:id?include_cast=true&include_screenwriters=true
```

## Usage Examples

### Adding Cast to a Movie

1. First, create or find the cast member:
```javascript
POST /api/cast
{
  "name": "Tom Hanks",
  "bio": "Academy Award winning actor",
  "profile_image_url": "https://example.com/tom-hanks.jpg"
}
```

2. Then add them to a movie:
```javascript
POST /api/cast/movie/1
{
  "cast_id": 1,
  "character_name": "Forrest Gump",
  "cast_order": 0  // 0 = lead role
}
```

### Adding Screenwriters to a Movie

1. First, create or find the screenwriter:
```javascript
POST /api/screenwriters
{
  "name": "Eric Roth",
  "bio": "Screenwriter known for Forrest Gump"
}
```

2. Then add them to a movie:
```javascript
POST /api/screenwriters/movie/1
{
  "screenwriter_id": 1,
  "screenwriter_order": 0
}
```

### Fetching Movie with Full Details

```javascript
GET /api/movies/1?include_cast=true&include_screenwriters=true
```

Response will include:
- Movie details
- Array of cast members with character names
- Array of screenwriters

## Migration

If you already have a database set up, run the migration script:

```bash
# Using Supabase SQL Editor
# Copy and paste contents of database/migration_add_cast_screenwriters.sql

# Or using psql
psql "your-connection-string" < database/migration_add_cast_screenwriters.sql
```

Or if setting up fresh, the main `schema.sql` already includes these tables.

## Design Decisions

1. **Many-to-Many Relationships**: Both cast and screenwriters use junction tables to support:
   - Multiple cast members per movie
   - Multiple screenwriters per movie
   - Cast members appearing in multiple movies
   - Screenwriters working on multiple movies

2. **Character Names**: Stored in junction table to allow same actor playing different characters in different movies

3. **Order Fields**: Allow sorting/prioritizing cast members (lead vs supporting) and screenwriters

4. **Unique Constraints**: Prevent duplicate entries (same cast member added twice to same movie)

5. **Cascade Deletes**: When a movie is deleted, related cast and screenwriter associations are automatically removed

