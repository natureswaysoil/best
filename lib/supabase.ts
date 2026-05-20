import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured');
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getServiceSupabase = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
};

export interface Customer {
  id?: string;
  name: string;
  email: string;
  created_at?: string;
}

export interface Address {
  name?: string;
  email?: string;
  phone?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  county?: string;
}

export interface Order {
  id?: string;
  customer_id?: string;
  status?: string;
  pi_id?: string;
  subtotal?: number;
  tax: number;
  shipping?: number;
  total: number;
  email?: string;
  name?: string;
  billing?: Address;
  shipping_address?: Address;
  shipping_state?: string;
  shipping_county?: string;
  shipping_zip?: string;
  shipping_city?: string;
  shipping_address1?: string;
  shipping_address2?: string;
  shipping_phone?: string;
  created_at?: string;
}

export interface OrderItem {
  id?: string;
  order_id: string;
  sku: string;
  qty: number;
  price: number;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  image?: string;
  tags?: string[];
  features?: string[];
  images?: string[];
  in_stock?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductSize {
  id?: string;
  product_id: string;
  name: string;
  price: number;
  sku: string;
  in_stock?: boolean;
  created_at?: string;
}
