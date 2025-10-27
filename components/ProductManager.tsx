import { useState, useEffect } from 'react';

interface ProductSize {
  id?: string;
  name: string;
  price: number;
  sku: string;
  in_stock?: boolean;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  image?: string;
  in_stock?: boolean;
  product_sizes?: ProductSize[];
}

const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      const data = await response.json();
      
      if (response.ok) {
        setProducts(data.products || []);
      } else {
        alert('Failed to load products');
      }
    } catch (error) {
      alert('Error loading products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Product Manager</h1>
      <p className="text-gray-600">Database-connected admin panel coming soon!</p>
    </div>
  );
};

export default ProductManager;