import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables for Supabase (Vite / Vercel / Render client)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let clientInstance: SupabaseClient | null = null;

export const isSupabaseClientConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseClientConfigured()) {
    return null;
  }
  if (!clientInstance) {
    try {
      clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return clientInstance;
};

// Safe export that will be null if environment variables are not provided
export const supabase = isSupabaseClientConfigured() ? getSupabaseClient() : null;

export const getSupabaseClientConfig = () => {
  return {
    isConfigured: isSupabaseClientConfigured(),
    url: supabaseUrl ? supabaseUrl.replace(/^(https?:\/\/[^/]+).*/, '$1') : null,
    hasAnonKey: Boolean(supabaseAnonKey),
  };
};
