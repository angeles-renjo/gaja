import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Recipe, RecipeWithIngredients, RecipeFormData } from '@/types';

interface RecipeStore {
  // State
  recipes: Recipe[];
  recipeDetails: Record<string, RecipeWithIngredients>;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;

  // Actions
  fetchRecipes: () => Promise<void>;
  fetchRecipe: (id: string) => Promise<void>;
  createRecipe: (formData: RecipeFormData) => Promise<{ success: boolean; recipeId?: string; error?: string }>;
  updateRecipe: (id: string, formData: RecipeFormData) => Promise<{ success: boolean; error?: string }>;
  deleteRecipe: (id: string) => Promise<{ success: boolean; error?: string }>;
  setSearchQuery: (query: string) => void;
  clearError: () => void;
}

export const useRecipeStore = create<RecipeStore>((set, get) => ({
  // Initial state
  recipes: [],
  recipeDetails: {},
  isLoading: false,
  error: null,
  searchQuery: '',

  // Fetch all recipes
  fetchRecipes: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ recipes: data || [], isLoading: false });
    } catch (err) {
      console.error('Error fetching recipes:', err);
      set({
        error: err instanceof Error ? err.message : 'Failed to load recipes',
        isLoading: false,
      });
    }
  },

  // Fetch single recipe with ingredients
  fetchRecipe: async (id: string) => {
    // Check if already cached
    const cached = get().recipeDetails[id];
    if (cached) {
      return; // Already have it
    }

    set({ isLoading: true, error: null });
    try {
      // Fetch recipe
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (recipeError) {
        // Handle PGRST116 (recipe not found) gracefully
        if (recipeError.code === 'PGRST116') {
          set({
            error: 'Recipe not found',
            isLoading: false,
          });
          return;
        }
        throw recipeError;
      }

      // Fetch ingredients
      const { data: ingredientsData, error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .select('*')
        .eq('recipe_id', id)
        .order('order_index', { ascending: true });

      if (ingredientsError) throw ingredientsError;

      const recipeWithIngredients: RecipeWithIngredients = {
        ...recipeData,
        ingredients: ingredientsData || [],
      };

      set((state) => ({
        recipeDetails: {
          ...state.recipeDetails,
          [id]: recipeWithIngredients,
        },
        isLoading: false,
      }));
    } catch (err) {
      console.error('Error fetching recipe:', err);
      set({
        error: err instanceof Error ? err.message : 'Failed to load recipe',
        isLoading: false,
      });
    }
  },

  // Create new recipe
  createRecipe: async (formData: RecipeFormData) => {
    set({ isLoading: true, error: null });
    try {
      // Insert recipe
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .insert({
          name: formData.name,
          instructions: formData.instructions,
        })
        .select()
        .single();

      if (recipeError) throw recipeError;

      // Insert ingredients
      if (formData.ingredients.length > 0) {
        const ingredientsToInsert = formData.ingredients.map((ing, index) => ({
          recipe_id: recipeData.id,
          ingredient_name: ing.ingredient_name,
          weight: ing.weight,
          order_index: index,
        }));

        const { error: ingredientsError } = await supabase
          .from('recipe_ingredients')
          .insert(ingredientsToInsert);

        if (ingredientsError) throw ingredientsError;
      }

      // Update local state - add to recipes list
      set((state) => ({
        recipes: [recipeData, ...state.recipes],
        isLoading: false,
      }));

      return { success: true, recipeId: recipeData.id };
    } catch (err) {
      console.error('Error creating recipe:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create recipe';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Update recipe
  updateRecipe: async (id: string, formData: RecipeFormData) => {
    set({ isLoading: true, error: null });
    try {
      // Update recipe
      const { error: recipeError } = await supabase
        .from('recipes')
        .update({
          name: formData.name,
          instructions: formData.instructions,
        })
        .eq('id', id);

      if (recipeError) throw recipeError;

      // Delete existing ingredients
      const { error: deleteError } = await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', id);

      if (deleteError) throw deleteError;

      // Insert new ingredients
      if (formData.ingredients.length > 0) {
        const ingredientsToInsert = formData.ingredients.map((ing, index) => ({
          recipe_id: id,
          ingredient_name: ing.ingredient_name,
          weight: ing.weight,
          order_index: index,
        }));

        const { error: ingredientsError } = await supabase
          .from('recipe_ingredients')
          .insert(ingredientsToInsert);

        if (ingredientsError) throw ingredientsError;
      }

      // Update local state - update recipes list
      set((state) => ({
        recipes: state.recipes.map((r) =>
          r.id === id ? { ...r, name: formData.name, instructions: formData.instructions } : r
        ),
        // Clear cached detail so it refetches
        recipeDetails: Object.fromEntries(
          Object.entries(state.recipeDetails).filter(([key]) => key !== id)
        ),
        isLoading: false,
      }));

      return { success: true };
    } catch (err) {
      console.error('Error updating recipe:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update recipe';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Delete recipe
  deleteRecipe: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error: deleteError } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Update local state - remove from recipes list
      // Note: We don't clear recipeDetails here to avoid triggering a refetch
      // of the deleted recipe. The cache will be cleared naturally on navigation.
      set((state) => ({
        recipes: state.recipes.filter((r) => r.id !== id),
        isLoading: false,
      }));

      return { success: true };
    } catch (err) {
      console.error('Error deleting recipe:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete recipe';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  setSearchQuery: (query: string) => set({ searchQuery: query }),

  clearError: () => set({ error: null }),
}));

// Selector hook for filtered recipes
export const useFilteredRecipes = () => {
  const recipes = useRecipeStore((state) => state.recipes);
  const searchQuery = useRecipeStore((state) => state.searchQuery);

  if (!searchQuery.trim()) {
    return recipes;
  }

  const query = searchQuery.toLowerCase();
  return recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(query)
  );
};
