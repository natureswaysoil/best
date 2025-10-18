import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For server-side operations with service role
export const getServiceSupabase = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });
};

// Database Types
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
  pi_id?: string; // Stripe PaymentIntent ID
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  email?: string;
  name?: string;
  billing?: Address;
  shipping_address?: Address;
  created_at?: string;
}

export interface OrderItem {
  id?: string;
  order_id: string;
  sku: string;
  qty: number;
  unit_price: number;
  created_at?: string;
}