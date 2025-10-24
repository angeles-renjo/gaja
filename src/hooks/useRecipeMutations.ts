import { useRecipeStore } from '@/stores/recipe-store';

export function useCreateRecipe() {
  const isLoading = useRecipeStore((state) => state.isLoading);
  const error = useRecipeStore((state) => state.error);
  const createRecipe = useRecipeStore((state) => state.createRecipe);

  return { createRecipe, isLoading, error };
}

export function useUpdateRecipe() {
  const isLoading = useRecipeStore((state) => state.isLoading);
  const error = useRecipeStore((state) => state.error);
  const updateRecipe = useRecipeStore((state) => state.updateRecipe);

  return { updateRecipe, isLoading, error };
}

export function useDeleteRecipe() {
  const isLoading = useRecipeStore((state) => state.isLoading);
  const error = useRecipeStore((state) => state.error);
  const deleteRecipe = useRecipeStore((state) => state.deleteRecipe);

  return { deleteRecipe, isLoading, error };
}
