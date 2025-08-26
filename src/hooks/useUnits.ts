import { useState, useEffect } from 'react';
import type { Unit } from '@/types';

export function useUnits() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/units');
        const result = await response.json();
        
        if (result.success) {
          setUnits(result.data);
        } else {
          setError(result.error || 'Failed to fetch units');
        }
      } catch (err) {
        setError('Failed to fetch units');
        console.error('Error fetching units:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnits();
  }, []);

  const getUnitById = (id: string): Unit | undefined => {
    return units.find(unit => unit.id === id);
  };

  const getUnitBySymbol = (symbol: string): Unit | undefined => {
    return units.find(unit => unit.symbol === symbol);
  };

  const getDefaultUnit = (): Unit | undefined => {
    return units.find(unit => unit.symbol === 'kg') || units[0];
  };

  return {
    units,
    isLoading,
    error,
    getUnitById,
    getUnitBySymbol,
    getDefaultUnit,
  };
}
