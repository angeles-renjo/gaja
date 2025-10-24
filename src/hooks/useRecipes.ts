import { useEffect } from 'react';
import { useRecipeStore } from '@/stores/recipe-store';

export function useRecipes() {
  const recipes = useRecipeStore((state) => state.recipes);
  const isLoading = useRecipeStore((state) => state.isLoading);
  const error = useRecipeStore((state) => state.error);
  const fetchRecipes = useRecipeStore((state) => state.fetchRecipes);

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
    refetch: fetchRecipes
  };
}
