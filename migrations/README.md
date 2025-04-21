# Role-Based Access Control Migrations

This directory contains SQL migrations that will be used to implement role-based access control in the future.

## Planned Migration

The `add_user_role.sql` migration will:

1. Create a 'role' enum type with values 'admin', 'publisher', and 'user'
2. Add a 'role' column to the users table
3. Automatically assign the 'admin' role to users who have isAdmin=true

## How to Run the Migration

When we are ready to implement the role-based access control feature, we can run the migration manually:

```bash
psql $DATABASE_URL -f migrations/add_user_role.sql
```

## Current Implementation

For now, the application uses the existing `isAdmin` boolean field to determine permissions:

- Admin users have full access to all features
- In the future, publisher roles will have limited permissions to:
  - Add/edit products (but not delete them)
  - View customer messages (but not modify them)
  - No access to modify website settings

The codebase is already prepared with the necessary middleware to handle these roles once the database migration is completed.