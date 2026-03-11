import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gixjfavlefeldoostsij.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpeGpmYXZsZWZlbGRvb3N0c2lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4ODU1NTksImV4cCI6MjA3NTQ2MTU1OX0.PyqZqTyqazmzAppsLxjG52kGVcxJfpX1hofq-lLPgM4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For server-side operations with service role
export const getServiceSupabase = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpeGpmYXZsZWZlbGRvb3N0c2lqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTg4NTU1OSwiZXhwIjoyMDc1NDYxNTU5fQ.tUkgA14BmnB6B-xN9xlvEW6WpXvfYx9N5q6o2i-q2iE';
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
  price: number; // Your table uses 'price' instead of 'unit_price'
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