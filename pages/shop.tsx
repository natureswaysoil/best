import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { Grid, List, Search } from 'lucide-react';
import Layout from '../components/Layout';
import { allProducts } from '../data/products';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  category: string;
  tags: string[];
}

interface ShopProps {
  products: Product[];
  categories: string[];
}

export default function Shop({ products, categories }: ShopProps) {
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    filterProducts(category, searchTerm, sortBy);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterProducts(selectedCategory, term, sortBy);
  };

  const handleSort = (sortOption: string) => {
    setSortBy(sortOption);
    filterProducts(selectedCategory, searchTerm, sortOption);
  };

  const filterProducts = (category: string, search: string, sort: string) => {
    let filtered = [...products];

    // Filter by category
    if (category !== 'All') {
      filtered = filtered.filter(product => product.category === category);
    }

    // Filter by search term
    if (search) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sort) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  };

  return (
    <>
      <Head>
        <title>Shop - Nature's Way Soil Products</title>
        <meta name="description" content="Browse our selection of natural fertilizers, biochar, and compost products for healthier soil and better plant growth." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Shop Products</h1>
            <p className="text-xl text-gray-600">
              Discover our complete range of natural soil amendments and fertilizers
            </p>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {['All', ...categories].map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryFilter(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-nature-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Sort and View Options */}
              <div className="flex items-center gap-4">
                <select
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>

                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-nature-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-nature-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-6"
          }>
            {filteredProducts.map((product) => (
              <div key={product.id} className={viewMode === 'grid'
                ? "bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group"
                : "bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden flex gap-6 p-6"
              }>
                <div className={viewMode === 'grid' ? "relative aspect-square overflow-hidden bg-white border border-gray-200" : "w-48 aspect-square overflow-hidden rounded-xl flex-shrink-0 bg-white border border-gray-200"}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                  />
                  {product.originalPrice && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                      Sale
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-nature-green-600 text-white px-2 py-1 rounded-full text-sm font-medium">
                    {product.category}
                  </div>
                </div>
                
                <div className={viewMode === 'grid' ? "p-6" : "flex-1"}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  
                  <p className={`text-gray-600 text-sm mb-4 ${viewMode === 'grid' ? 'line-clamp-2' : 'line-clamp-3'}`}>
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold text-nature-green-600">
                        ${product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-lg text-gray-500 line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                    
                    <Link 
                      href={`/product/${product.id}`}
                      className="btn-primary text-sm py-2 px-4"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchTerm('');
                  setFilteredProducts(products);
                }}
                className="btn-primary"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps<ShopProps> = async () => {
  // Use products from the centralized data file
  const products: Product[] = allProducts.map(p => ({
    id: p.id,
    name: p.name,
    price: p.sizes && p.sizes.length > 0 ? p.sizes[0].price : p.price,
    ...(p.originalPrice && { originalPrice: p.originalPrice }),
    image: p.image,
    description: p.description,
    category: p.category,
    tags: p.tags
  }));

  const categories = Array.from(new Set(products.map(p => p.category)));

  return {
    props: {
      products,
      categories,
    },
  };
};