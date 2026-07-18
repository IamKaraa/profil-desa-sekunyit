import { createClient } from '@supabase/supabase-js';

// Mengambil kunci dari file .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Membuat jembatan koneksi
export const supabase = createClient(supabaseUrl, supabaseAnonKey);