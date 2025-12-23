import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { Product, ProductCategory } from '../types';

interface UseMarketplaceItemsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  loadProducts: () => Promise<void>;
  getProductsByCategory: (category: ProductCategory) => Product[];
  getDealsByCategory: (category: ProductCategory) => Product[];
}

export const useMarketplaceItems = (): UseMarketplaceItemsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts(data || []);
    } catch (err) {
      console.error('Error loading marketplace products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const getProductsByCategory = (category: ProductCategory): Product[] => {
    return products.filter(product => product.category === category);
  };

  const getDealsByCategory = (category: ProductCategory): Product[] => {
    return products.filter(product => 
      product.category === category && 
      product.deal_percentage && 
      product.deal_percentage > 0
    );
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return {
    products,
    loading,
    error,
    loadProducts,
    getProductsByCategory,
    getDealsByCategory
  };
};
