import { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  basePrice: number;
  images: { id: string; image: string }[];
  baseUnit: { id: string; name: string; symbol: string };
  discounts: { id: string; value: number; discountType: string; endDate: string }[];
  isAmazing: boolean;
}

interface AmazingDealsResponse {
  success: boolean;
  data: Product[];
  count: number;
}

export function useAmazingDeals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAmazingDeals = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/amazing-deals');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: AmazingDealsResponse = await response.json();
        
        if (data.success) {
          setProducts(data.data);
        } else {
          throw new Error('Failed to fetch amazing deals');
        }
      } catch (err) {
        console.error('Error fetching amazing deals:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAmazingDeals();
  }, []);

  return { products, loading, error };
}
