import { useState, useEffect } from 'react';
import type { Unit } from '@/types';

interface UseUnitsResult {
  units: Unit[];
  loading: boolean;
  error: string | null;
}

export function useUnits(): UseUnitsResult {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/units');
        const data = await response.json();
        
        if (data.success) {
          setUnits(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch units');
        }
      } catch (err) {
        console.error('Error fetching units:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch units');
        
        // Fallback to default units if API fails
        setUnits([
          { 
            id: 'default-1', 
            name: 'Gram', 
            symbol: 'g', 
            multiplier: 0.001, 
            isActive: true, 
            sortOrder: 1, 
            createdAt: new Date(), 
            updatedAt: new Date() 
          },
          { 
            id: 'default-2', 
            name: 'Kilogram', 
            symbol: 'kg', 
            multiplier: 1.0, 
            isActive: true, 
            sortOrder: 2, 
            createdAt: new Date(), 
            updatedAt: new Date() 
          },
          { 
            id: 'default-3', 
            name: 'Package', 
            symbol: 'pkg', 
            multiplier: 1.0, 
            isActive: true, 
            sortOrder: 3, 
            createdAt: new Date(), 
            updatedAt: new Date() 
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, []);

  return { units, loading, error };
}