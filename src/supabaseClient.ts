import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cwlntqhxzipeuyoyrzfw.supabase.co' // Replace with your project URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bG50cWh4emlwZXV5b3lyemZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5Nzg0NzUsImV4cCI6MjA2NDU1NDQ3NX0.hjg_lmPB-PpJk0AuQtqvaUKwxy1E2nb9OfuHZEfBLCo' // Replace with your Supabase anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
