-- First, create the role enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
        CREATE TYPE role AS ENUM ('admin', 'publisher', 'user');
    END IF;
END $$;

-- Add role column to users table if it doesn't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role role NOT NULL DEFAULT 'user';

-- Update existing admin users to have admin role
UPDATE users 
SET role = 'admin' 
WHERE is_admin = true;

-- This SQL file can be executed manually when ready to implement user roles
-- For now, we're continuing to use the existing isAdmin field