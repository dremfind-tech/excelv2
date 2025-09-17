-- NextAuth.js database schema for Supabase
-- Run this in your Supabase SQL Editor

-- Create the next_auth schema
CREATE SCHEMA IF NOT EXISTS next_auth;

-- Users table (managed by NextAuth)
CREATE TABLE IF NOT EXISTS next_auth.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  "emailVerified" TIMESTAMPTZ,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accounts table (for OAuth providers)
CREATE TABLE IF NOT EXISTS next_auth.accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES next_auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, "providerAccountId")
);

-- Sessions table (for database sessions)
CREATE TABLE IF NOT EXISTS next_auth.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "sessionToken" TEXT NOT NULL UNIQUE,
  "userId" UUID NOT NULL REFERENCES next_auth.users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification tokens table (for email verification)
CREATE TABLE IF NOT EXISTS next_auth.verification_tokens (
  identifier TEXT,
  token TEXT,
  expires TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (identifier, token)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON next_auth.accounts("userId");
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON next_auth.sessions("userId");
CREATE INDEX IF NOT EXISTS sessions_session_token_idx ON next_auth.sessions("sessionToken");

-- Function to sync NextAuth users with our profiles table
CREATE OR REPLACE FUNCTION public.sync_nextauth_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles table when a user is created in next_auth.users
  INSERT INTO public.profiles (id, email, name, avatar, plan)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.name, split_part(NEW.email, '@', 1)),
    COALESCE(NEW.image, 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.email),
    'Free'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    avatar = COALESCE(EXCLUDED.avatar, profiles.avatar),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync users from NextAuth to profiles
DROP TRIGGER IF EXISTS on_nextauth_user_created ON next_auth.users;
CREATE TRIGGER on_nextauth_user_created
  AFTER INSERT OR UPDATE ON next_auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.sync_nextauth_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA next_auth TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA next_auth TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA next_auth TO anon, authenticated, service_role;

-- Updated timestamp triggers
CREATE OR REPLACE FUNCTION next_auth.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON next_auth.users
  FOR EACH ROW EXECUTE PROCEDURE next_auth.update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON next_auth.accounts
  FOR EACH ROW EXECUTE PROCEDURE next_auth.update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON next_auth.sessions
  FOR EACH ROW EXECUTE PROCEDURE next_auth.update_updated_at_column();