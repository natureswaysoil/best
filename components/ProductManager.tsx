import { useState } from 'react';
import { allProducts, ProductData } from '../data/products';

const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<ProductData[]>(allProducts);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState<Partial<ProductData>>({
    id: '',
    name: '',
    price: 0,
    image: '',
    description: '',
    category: '',
    tags: [],
    features: [],
    images: [],
    inStock: true,
    sizes: []
  });

  const handleEdit = (product: ProductData) => {
    setEditingProduct(product);
    setFormData(product);
    setShowAddForm(true);
  };

  const handleSave = () => {
    // In a real app, this would save to your backend/database
    console.log('Saving product:', formData);
    
    if (editingProduct) {
      // Update existing product
      const updatedProducts = products.map(p => 
        p.id === editingProduct.id ? formData as ProductData : p
      );
      setProducts(updatedProducts);
    } else {
      // Add new product
      setProducts([...products, formData as ProductData]);
    }
    
    setShowAddForm(false);
    setEditingProduct(null);
    setFormData({
      id: '',
      name: '',
      price: 0,
      image: '',
      description: '',
      category: '',
      tags: [],
      features: [],
      images: [],
      inStock: true,
      sizes: []
    });
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingProduct(null);
    setFormData({
      id: '',
      name: '',
      price: 0,
      image: '',
      description: '',
      category: '',
      tags: [],
      features: [],
      images: [],
      inStock: true,
      sizes: []
    });
  };

  const generateDataFile = () => {
    const dataContent = `// Auto-generated product data
export const allProducts = ${JSON.stringify(products, null, 2)};

export function getProductById(id: string) {
  return allProducts.find(p => p.id === id);
}

export function getAllProductIds() {
  return allProducts.map(p => p.id);
}
`;

    const blob = new Blob([dataContent], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.ts';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Product Manager</h1>
        <div className="space-x-4">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
          >
            Add New Product
          </button>
          <button
            onClick={generateDataFile}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Download Updated Data File
          </button>
        </div>
      </div>

      {/* Product List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md p-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover rounded-md mb-4"
            />
            <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-2">ID: {product.id}</p>
            <div className="mb-2">
              {product.sizes && product.sizes.length > 0 ? (
                <div>
                  {product.sizes.map((size, idx) => (
                    <div key={idx} className="text-sm">
                      {size.name}: ${size.price.toFixed(2)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-green-600 font-semibold">${product.price.toFixed(2)}</p>
              )}
            </div>
            <button
              onClick={() => handleEdit(product)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
            >
              Edit
            </button>
          </div>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Product ID</label>
                <input
                  type="text"
                  value={formData.id || ''}
                  onChange={(e) => setFormData({...formData, id: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="NWS_XXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Product Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Base Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price || 0}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Image URL</label>
                <input
                  type="url"
                  value={formData.image || ''}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select Category</option>
                  <option value="Fertilizer">Fertilizer</option>
                  <option value="Soil Amendment">Soil Amendment</option>
                  <option value="Lawn Care">Lawn Care</option>
                  <option value="Compost">Compost</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              {/* Sizes Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Sizes</label>
                {formData.sizes?.map((size, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Size name"
                      value={size.name}
                      onChange={(e) => {
                        const newSizes = [...(formData.sizes || [])];
                        newSizes[index] = {...size, name: e.target.value};
                        setFormData({...formData, sizes: newSizes});
                      }}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={size.price}
                      onChange={(e) => {
                        const newSizes = [...(formData.sizes || [])];
                        newSizes[index] = {...size, price: parseFloat(e.target.value)};
                        setFormData({...formData, sizes: newSizes});
                      }}
                      className="w-24 border border-gray-300 rounded-md px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="SKU"
                      value={size.sku}
                      onChange={(e) => {
                        const newSizes = [...(formData.sizes || [])];
                        newSizes[index] = {...size, sku: e.target.value};
                        setFormData({...formData, sizes: newSizes});
                      }}
                      className="w-32 border border-gray-300 rounded-md px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newSizes = formData.sizes?.filter((_, i) => i !== index) || [];
                        setFormData({...formData, sizes: newSizes});
                      }}
                      className="bg-red-500 text-white px-3 py-2 rounded-md"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const newSizes = [...(formData.sizes || []), { name: '', price: 0, sku: '' }];
                    setFormData({...formData, sizes: newSizes});
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md"
                >
                  Add Size
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              >
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;