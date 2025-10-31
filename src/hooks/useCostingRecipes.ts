import { useEffect } from 'react';
import { useCostingRecipesStore } from '@/stores/costing-store';

export function useCostingRecipes() {
  const recipes = useCostingRecipesStore((state) => state.recipes);
  const isLoading = useCostingRecipesStore((state) => state.isLoading);
  const error = useCostingRecipesStore((state) => state.error);
  const fetchRecipes = useCostingRecipesStore((state) => state.fetchRecipes);

  useEffect(() => {
    // Only fetch if we don't have recipes yet
    if (recipes.length === 0) {
      fetchRecipes();
    }
  }, [recipes.length, fetchRecipes]);

  return {
    recipes,
    isLoading,
    error,
    refetch: fetchRecipes,
  };
}
