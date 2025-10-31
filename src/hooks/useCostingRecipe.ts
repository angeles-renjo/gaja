import { useEffect } from 'react';
import { useCostingRecipesStore } from '@/stores/costing-store';

export function useCostingRecipe(id: string) {
  const recipeDetails = useCostingRecipesStore((state) => state.recipeDetails);
  const isLoading = useCostingRecipesStore((state) => state.isLoading);
  const error = useCostingRecipesStore((state) => state.error);
  const fetchRecipe = useCostingRecipesStore((state) => state.fetchRecipe);

  const recipe = recipeDetails[id];

  useEffect(() => {
    // Only fetch if we don't have this recipe yet
    if (!recipe && id) {
      fetchRecipe(id);
    }
  }, [id, recipe, fetchRecipe]);

  return {
    recipe,
    isLoading,
    error,
    refetch: () => fetchRecipe(id),
  };
}
