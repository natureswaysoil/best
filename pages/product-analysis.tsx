import { allProducts } from '../data/products';

// Product analysis script
const analyzeProducts = () => {
  const issues = [];
  const imageUrls = new Set();
  const duplicateImages = [];

  allProducts.forEach((product) => {
    // Check for duplicate images
    if (imageUrls.has(product.image)) {
      duplicateImages.push(`${product.id} (${product.name}) shares image with another product`);
    } else {
      imageUrls.add(product.image);
    }

    // Check for missing usage instructions
    if (!product.usage || product.usage.length === 0) {
      issues.push(`${product.id}: Missing usage instructions`);
    }

    // Check for inconsistent pricing
    if (product.sizes && product.sizes.length > 0) {
      const basePrice = product.price;
      const firstSizePrice = product.sizes[0].price;
      if (Math.abs(basePrice - firstSizePrice) > 0.01) {
        issues.push(`${product.id}: Base price ($${basePrice}) doesn't match first size price ($${firstSizePrice})`);
      }
    }

    // Check for missing features
    if (!product.features || product.features.length < 3) {
      issues.push(`${product.id}: Has fewer than 3 feature points`);
    }

    // Check for single size products that should have multiple sizes
    if (product.category === 'Fertilizer' && (!product.sizes || product.sizes.length === 1)) {
      issues.push(`${product.id}: Fertilizer with only one size - consider adding more size options`);
    }

    // Check for very short descriptions
    if (product.description.length < 100) {
      issues.push(`${product.id}: Description is quite short (${product.description.length} chars)`);
    }

    // Check for products without videos
    if (!product.video) {
      issues.push(`${product.id}: No product video`);
    }
  });

  return {
    totalProducts: allProducts.length,
    issues,
    duplicateImages,
    productsWithoutUsage: allProducts.filter(p => !p.usage || p.usage.length === 0).length,
    productsWithoutVideos: allProducts.filter(p => !p.video).length,
    fertilizersWithOneSize: allProducts.filter(p => p.category === 'Fertilizer' && (!p.sizes || p.sizes.length === 1)).length
  };
};

export default function ProductAnalysis() {
  const analysis = analyzeProducts();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Product Analysis Report</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Summary</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>Total Products: {analysis.totalProducts}</div>
          <div>Products without usage: {analysis.productsWithoutUsage}</div>
          <div>Products without videos: {analysis.productsWithoutVideos}</div>
          <div>Fertilizers with one size: {analysis.fertilizersWithOneSize}</div>
        </div>
      </div>

      {analysis.duplicateImages.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold mb-2 text-red-800">Duplicate Images</h2>
          <ul className="list-disc list-inside">
            {analysis.duplicateImages.map((issue, index) => (
              <li key={index} className="text-red-700">{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {analysis.issues.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold mb-2 text-yellow-800">Issues Found</h2>
          <ul className="list-disc list-inside space-y-1">
            {analysis.issues.map((issue, index) => (
              <li key={index} className="text-yellow-700">{issue}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2 text-green-800">Recommendations</h2>
        <ul className="list-disc list-inside space-y-1 text-green-700">
          <li>Add usage instructions to products that are missing them</li>
          <li>Consider adding multiple size options for fertilizer products</li>
          <li>Create product videos for products that don't have them</li>
          <li>Ensure each product has unique, appropriate images</li>
          <li>Expand short product descriptions with more details</li>
        </ul>
      </div>
    </div>
  );
}