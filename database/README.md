# Database Setup

## Running Migrations

To set up the database schema, run:

```bash
node database/migrate.js
```

Make sure you have:
1. Created a PostgreSQL database
2. Set the `DATABASE_URL` environment variable in `backend/.env`

## Database Schema

The database includes the following tables:

- **users**: User accounts for authentication
- **movies**: Movie information
- **reviews**: Movie reviews with ratings and tags
- **watchlist**: Movies users want to watch

See `schema.sql` for the complete schema definition.

