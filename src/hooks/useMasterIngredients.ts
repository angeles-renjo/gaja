import { useEffect } from 'react';
import { useMasterIngredientsStore } from '@/stores/costing-store';

export function useMasterIngredients() {
  const ingredients = useMasterIngredientsStore((state) => state.ingredients);
  const isLoading = useMasterIngredientsStore((state) => state.isLoading);
  const error = useMasterIngredientsStore((state) => state.error);
  const fetchIngredients = useMasterIngredientsStore((state) => state.fetchIngredients);

  useEffect(() => {
    // Only fetch if we don't have ingredients yet
    if (ingredients.length === 0) {
      fetchIngredients();
    }
  }, [ingredients.length, fetchIngredients]);

  return {
    ingredients,
    isLoading,
    error,
    refetch: fetchIngredients,
  };
}
