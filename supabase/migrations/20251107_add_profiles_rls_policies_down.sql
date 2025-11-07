-- Rollback: Remove RLS policies from profiles table

-- Drop policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON profiles;

-- Disable RLS on profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
