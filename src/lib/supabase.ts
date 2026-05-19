import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials missing! Check your .env file. Using placeholder credentials to prevent load-time crash.');
}

const fallbackUrl = supabaseUrl || 'https://placeholder-project-id.supabase.co';
const fallbackKey = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE1NzA3MDQwMDAsImV4cCI6MTg4NjI4MDAwMH0.placeholder';

export const supabase = createClient(fallbackUrl, fallbackKey);
