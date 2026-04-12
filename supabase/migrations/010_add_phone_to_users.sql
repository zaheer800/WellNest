-- Add phone number column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone text;
