-- Migration: Add file uploads table and storage
-- This migration creates the necessary tables and storage buckets for user file uploads

-- Create uploads table to track user files
CREATE TABLE IF NOT EXISTS public.uploads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filename text NOT NULL,
  original_name text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text NOT NULL,
  storage_path text NOT NULL,
  preview_data jsonb, -- Store table preview data
  chart_specs jsonb, -- Store generated chart specifications
  prompt text, -- Store user prompt for regeneration
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster user queries
CREATE INDEX IF NOT EXISTS uploads_user_id_idx ON public.uploads(user_id);
CREATE INDEX IF NOT EXISTS uploads_created_at_idx ON public.uploads(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own uploads" ON public.uploads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own uploads" ON public.uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own uploads" ON public.uploads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own uploads" ON public.uploads
  FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for file uploads (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'uploads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'uploads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'uploads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic updated_at
CREATE TRIGGER update_uploads_updated_at
  BEFORE UPDATE ON public.uploads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();