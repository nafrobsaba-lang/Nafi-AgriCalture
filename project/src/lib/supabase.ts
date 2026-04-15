import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'farmer' | 'merchant' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  role: UserRole;
  region: string;
  location_lat?: number;
  location_lng?: number;
  avatar_url?: string;
  is_verified: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  farmer_id: string;
  name: string;
  category: 'vegetables' | 'fruits' | 'grains' | 'livestock' | 'dairy' | 'other';
  price: number;
  quantity: number;
  unit: 'kg' | 'quintal' | 'piece' | 'liter' | 'ton';
  description: string;
  harvest_date?: string;
  urgent_sale: boolean;
  images: string[];
  status: 'active' | 'sold' | 'inactive';
  region: string;
  created_at: string;
  profiles?: Profile;
}

export interface Order {
  id: string;
  product_id: string;
  farmer_id: string;
  merchant_id: string;
  quantity: number;
  total_price: number;
  status: 'pending' | 'accepted' | 'rejected' | 'delivered' | 'cancelled';
  payment_method: 'cash' | 'telebirr' | 'bank_transfer';
  notes: string;
  created_at: string;
  products?: Product;
  profiles?: Profile;
}

export interface Review {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  order_id?: string;
  rating: number;
  comment: string;
  reviewer_role: UserRole;
  created_at: string;
  profiles?: Profile;
}
