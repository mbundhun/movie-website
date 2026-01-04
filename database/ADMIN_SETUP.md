# Admin Setup Guide

## Step 1: Run the Migration

Run the SQL migration to add the `is_admin` column and `admin_requests` table:

```sql
-- Copy and paste the contents of database/migration_add_admin.sql into Supabase SQL Editor
```

Or use the migration script:
```bash
# The migration file is: database/migration_add_admin.sql
# Run it in Supabase SQL Editor
```

## Step 2: Set Your Account as Admin

After running the migration, set your account as admin by running this SQL query in Supabase SQL Editor:

```sql
-- Replace 'your_username' with your actual username
UPDATE users 
SET is_admin = TRUE 
WHERE username = 'your_username';
```

Or if you know your user ID:

```sql
-- Replace 1 with your actual user ID
UPDATE users 
SET is_admin = TRUE 
WHERE id = 1;
```

To find your user ID:

```sql
SELECT id, username, email FROM users;
```

## Step 3: Verify Admin Status

Check that your account is now an admin:

```sql
SELECT id, username, email, is_admin FROM users WHERE is_admin = TRUE;
```

## Future: Admin Request System

Users can request admin access by calling:
- `POST /api/admin/request` with optional `request_message`

Admins can:
- View pending requests: `GET /api/admin/requests`
- Approve/Reject requests: `PUT /api/admin/requests/:id` with `{ action: 'approve' | 'reject' }`

Email notifications for admin requests are planned for future implementation.

