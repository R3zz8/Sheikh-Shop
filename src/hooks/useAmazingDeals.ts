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
  error?: string;
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
          // Try to get error details from the response
          let errorMessage = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage += ` - ${errorData.error || errorData.message || 'Unknown server error'}`;
          } catch (jsonError) {
            // If we can't parse the error response, use status text
            errorMessage += ` - ${response.statusText || 'Server error'}`;
          }
          throw new Error(errorMessage);
        }
        
        const data: AmazingDealsResponse = await response.json();
        
        if (data.success) {
          setProducts(data.data || []);
        } else {
          throw new Error(data.error || 'Failed to fetch amazing deals');
        }
      } catch (err) {
        console.error('Error fetching amazing deals:', err);
        
        // Provide user-friendly error messages
        let userMessage = 'An error occurred';
        if (err instanceof Error) {
          if (err.message.includes('Failed to fetch')) {
            userMessage = 'Unable to connect to the server. Please check your internet connection.';
          } else if (err.message.includes('Database connection failed')) {
            userMessage = 'Service temporarily unavailable. Please try again later.';
          } else if (err.message.includes('Database schema mismatch')) {
            userMessage = 'System maintenance in progress. Please try again later.';
          } else {
            userMessage = err.message;
          }
        }
        
        setError(userMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAmazingDeals();
  }, []);

  return { products, loading, error };
}
