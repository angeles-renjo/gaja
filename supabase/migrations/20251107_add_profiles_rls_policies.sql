-- Enable Row Level Security on profiles table
-- This ensures that profiles data is protected by access policies

-- Enable RLS if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
-- Allows authenticated users to view their own profile data
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
-- Allows authenticated users to update their own profile data (e.g., username)
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Authenticated users can insert their own profile
-- This is used by the trigger that auto-creates profiles on signup
CREATE POLICY "Authenticated users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Note: Admins using the service role key bypass RLS entirely
-- This allows the admin client to create/read/update/delete any profile
