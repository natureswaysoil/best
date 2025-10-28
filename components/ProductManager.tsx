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

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      const data = await response.json();
      
      if (response.ok) {
        setProducts(data.products || []);
      } else {
        console.error('Failed to load products');
        alert('Failed to load products');
      }
    } catch (err) {
      console.error('Error loading products:', err);
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
      
      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          Total Products: {products.length}
        </p>
        
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product.id} className="bg-white border rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-green-600 font-bold">${product.price}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Stock: {product.in_stock ? 'In Stock' : 'Out of Stock'}
                </p>
                {product.product_sizes && product.product_sizes.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Sizes:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {product.product_sizes.map((size, index) => (
                        <span 
                          key={index}
                          className="text-xs bg-gray-100 px-2 py-1 rounded"
                        >
                          {size.name} - ${size.price}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No products found. Database connection or API may need configuration.</p>
        )}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Admin Features Coming Soon</h2>
        <ul className="text-sm text-gray-600 list-disc list-inside">
          <li>Add new products</li>
          <li>Edit existing products</li>
          <li>Manage inventory</li>
          <li>Bulk import/export</li>
        </ul>
      </div>
    </div>
  );
};

export default ProductManager;