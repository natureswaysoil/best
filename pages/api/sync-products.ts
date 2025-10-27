import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '../../lib/supabase';
import { allProducts } from '../../data/products';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const supabase = getServiceSupabase();

  try {
    console.log('Starting product sync to database...');
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const product of allProducts) {
      try {
        // Insert or update product
        const { error: productError } = await supabase
          .from('products')
          .upsert({
            id: product.id,
            name: product.name,
            description: product.description || '',
            category: product.category || '',
            price: product.price,
            image: product.image || '',
            tags: product.tags || [],
            features: product.features || [],
            images: product.images || [],
            in_stock: product.inStock ?? true
          }, {
            onConflict: 'id'
          });

        if (productError) {
          console.error(`Error syncing product ${product.id}:`, productError);
          errors.push(`Product ${product.id}: ${productError.message}`);
          errorCount++;
          continue;
        }

        // Handle sizes if they exist
        if (product.sizes && product.sizes.length > 0) {
          // Delete existing sizes for this product
          await supabase
            .from('product_sizes')
            .delete()
            .eq('product_id', product.id);

          // Insert new sizes
          const sizesWithProductId = product.sizes.map(size => ({
            product_id: product.id,
            name: size.name,
            price: size.price,
            sku: size.sku,
            in_stock: true
          }));

          const { error: sizesError } = await supabase
            .from('product_sizes')
            .insert(sizesWithProductId);

          if (sizesError) {
            console.error(`Error syncing sizes for product ${product.id}:`, sizesError);
            errors.push(`Sizes for ${product.id}: ${sizesError.message}`);
            errorCount++;
            continue;
          }
        }

        successCount++;
        console.log(`Successfully synced product: ${product.id}`);

      } catch (error) {
        console.error(`Unexpected error syncing product ${product.id}:`, error);
        errors.push(`Product ${product.id}: Unexpected error`);
        errorCount++;
      }
    }

    console.log(`Sync complete. Success: ${successCount}, Errors: ${errorCount}`);

    return res.status(200).json({
      message: 'Product sync completed',
      successCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Sync API error:', error);
    return res.status(500).json({ error: 'Internal server error during sync' });
  }
}