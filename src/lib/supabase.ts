import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env vars. Check .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  sort_order: number;
  created_at: string;
};

export type Supplier = {
  id: string;
  name: string;
  region: string | null;
  contact: string | null;
  notes: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  category_id: string | null;
  supplier_id: string | null;
  unit: string;
  quantity: number;
  min_threshold: number;
  price_per_unit: number;
  origin: string | null;
  season: string | null;
  quality_grade: string;
  description: string | null;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  supplier?: Supplier | null;
};

export type StockMovement = {
  id: string;
  product_id: string;
  movement_type: 'in' | 'out';
  quantity: number;
  reason: string | null;
  reference: string | null;
  notes: string | null;
  created_at: string;
  product?: Product | null;
};
