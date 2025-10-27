import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '../../lib/supabase';

interface ProductSizeInput {
  name: string;
  price: number;
  sku: string;
  in_stock?: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = getServiceSupabase();

  try {
    switch (req.method) {
      case 'GET':
        // Get all products with their sizes
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            product_sizes (*)
          `)
          .order('created_at', { ascending: false });

        if (productsError) {
          console.error('Error fetching products:', productsError);
          return res.status(500).json({ error: 'Failed to fetch products' });
        }

        return res.status(200).json({ products });

      case 'POST':
        // Create new product
        const { product, sizes } = req.body;

        if (!product.id || !product.name || !product.price) {
          return res.status(400).json({ error: 'Missing required fields: id, name, price' });
        }

        // Insert product
        const { data: newProduct, error: productError } = await supabase
          .from('products')
          .insert([{
            id: product.id,
            name: product.name,
            description: product.description || '',
            category: product.category || '',
            price: product.price,
            image: product.image || '',
            tags: product.tags || [],
            features: product.features || [],
            images: product.images || [],
            in_stock: product.in_stock ?? true
          }])
          .select()
          .single();

        if (productError) {
          console.error('Error creating product:', productError);
          return res.status(500).json({ error: 'Failed to create product' });
        }

        // Insert sizes if provided
        if (sizes && sizes.length > 0) {
          const sizesWithProductId = sizes.map((size: ProductSizeInput) => ({
            product_id: product.id,
            name: size.name,
            price: size.price,
            sku: size.sku,
            in_stock: size.in_stock ?? true
          }));

          const { error: sizesError } = await supabase
            .from('product_sizes')
            .insert(sizesWithProductId);

          if (sizesError) {
            console.error('Error creating product sizes:', sizesError);
            // Clean up the product if sizes failed
            await supabase.from('products').delete().eq('id', product.id);
            return res.status(500).json({ error: 'Failed to create product sizes' });
          }
        }

        return res.status(201).json({ message: 'Product created successfully', product: newProduct });

      case 'PUT':
        // Update existing product
        const { id } = req.query;
        const { product: updateProduct, sizes: updateSizes } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'Product ID is required' });
        }

        // Update product
        const { error: updateError } = await supabase
          .from('products')
          .update({
            name: updateProduct.name,
            description: updateProduct.description || '',
            category: updateProduct.category || '',
            price: updateProduct.price,
            image: updateProduct.image || '',
            tags: updateProduct.tags || [],
            features: updateProduct.features || [],
            images: updateProduct.images || [],
            in_stock: updateProduct.in_stock ?? true
          })
          .eq('id', id);

        if (updateError) {
          console.error('Error updating product:', updateError);
          return res.status(500).json({ error: 'Failed to update product' });
        }

        // Update sizes - delete existing and insert new ones
        if (updateSizes) {
          // Delete existing sizes
          await supabase.from('product_sizes').delete().eq('product_id', id);

          // Insert new sizes
          if (updateSizes.length > 0) {
            const sizesWithProductId = updateSizes.map((size: ProductSizeInput) => ({
              product_id: id,
              name: size.name,
              price: size.price,
              sku: size.sku,
              in_stock: size.in_stock ?? true
            }));

            const { error: sizesError } = await supabase
              .from('product_sizes')
              .insert(sizesWithProductId);

            if (sizesError) {
              console.error('Error updating product sizes:', sizesError);
              return res.status(500).json({ error: 'Failed to update product sizes' });
            }
          }
        }

        return res.status(200).json({ message: 'Product updated successfully' });

      case 'DELETE':
        // Delete product
        const { id: deleteId } = req.query;

        if (!deleteId) {
          return res.status(400).json({ error: 'Product ID is required' });
        }

        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .eq('id', deleteId);

        if (deleteError) {
          console.error('Error deleting product:', deleteError);
          return res.status(500).json({ error: 'Failed to delete product' });
        }

        return res.status(200).json({ message: 'Product deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}