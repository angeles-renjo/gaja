import { useEffect } from 'react';
import { useRecipeStore } from '@/stores/recipe-store';

export function useRecipe(recipeId: string | null) {
  const recipeDetails = useRecipeStore((state) => state.recipeDetails);
  const isLoading = useRecipeStore((state) => state.isLoading);
  const error = useRecipeStore((state) => state.error);
  const fetchRecipe = useRecipeStore((state) => state.fetchRecipe);

  const recipe = recipeId ? recipeDetails[recipeId] : null;

  useEffect(() => {
    if (recipeId && !recipeDetails[recipeId]) {
      fetchRecipe(recipeId);
    }
  }, [recipeId, recipeDetails, fetchRecipe]);

  return { recipe, isLoading, error };
}
