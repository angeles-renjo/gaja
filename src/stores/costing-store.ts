import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

// Types
export interface Supplier {
  id: string;
  supplier_name: string;
  created_at: string;
  updated_at: string;
}

export interface MasterIngredient {
  id: string;
  ingredient_name: string;
  weight: number;
  unit: 'g' | 'mL' | 'ea';
  purchase_price: number;
  price_per_unit: number;
  supplier_id?: string;
  notes?: string;
  date_added: string;
  created_at: string;
  updated_at: string;
}

export interface CostingRecipe {
  id: string;
  recipe_name: string;
  servings?: number;
  total_cost: number;
  cost_per_serving?: number;
  sell_price?: number;
  date_created: string;
  created_at: string;
  updated_at: string;
}

export interface CostingRecipeIngredient {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  ingredient_name?: string; // Populated from join
  quantity: number;
  unit: 'g' | 'mL' | 'ea';
  price_per_unit_snapshot: number;
  cost: number;
  created_at: string;
}

export interface CostingRecipeWithIngredients extends CostingRecipe {
  ingredients: CostingRecipeIngredient[];
}

export interface MasterIngredientFormData {
  ingredient_name: string;
  weight: number;
  unit: 'g' | 'mL' | 'ea';
  purchase_price: number;
  supplier_id?: string;
  notes?: string;
}

export interface CostingRecipeFormData {
  recipe_name: string;
  servings?: number;
  sell_price?: number;
  ingredients: {
    ingredient_id: string;
    quantity: number;
    unit: 'g' | 'mL' | 'ea';
  }[];
}

interface MasterIngredientsStore {
  // State
  ingredients: MasterIngredient[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchIngredients: () => Promise<void>;
  addIngredient: (ingredient: MasterIngredient) => void;
  updateIngredient: (id: string, ingredient: MasterIngredient) => void;
  removeIngredient: (id: string) => void;
  clearError: () => void;
}

interface CostingRecipesStore {
  // State
  recipes: CostingRecipe[];
  recipeDetails: Record<string, CostingRecipeWithIngredients>;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchRecipes: () => Promise<void>;
  fetchRecipe: (id: string) => Promise<void>;
  addRecipe: (recipe: CostingRecipe) => void;
  updateRecipe: (id: string, recipe: CostingRecipe) => void;
  removeRecipe: (id: string) => void;
  clearError: () => void;
}

// Master Ingredients Store
export const useMasterIngredientsStore = create<MasterIngredientsStore>((set) => ({
  // Initial state
  ingredients: [],
  isLoading: false,
  error: null,

  // Fetch all master ingredients
  fetchIngredients: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('master_ingredients')
        .select('*')
        .order('ingredient_name', { ascending: true });

      if (error) throw error;

      set({ ingredients: data || [], isLoading: false });
    } catch (err) {
      console.error('Error fetching master ingredients:', err);
      set({
        error: err instanceof Error ? err.message : 'Failed to load ingredients',
        isLoading: false,
      });
    }
  },

  addIngredient: (ingredient: MasterIngredient) => {
    set((state) => ({
      ingredients: [ingredient, ...state.ingredients],
    }));
  },

  updateIngredient: (id: string, ingredient: MasterIngredient) => {
    set((state) => ({
      ingredients: state.ingredients.map((ing) =>
        ing.id === id ? ingredient : ing
      ),
    }));
  },

  removeIngredient: (id: string) => {
    set((state) => ({
      ingredients: state.ingredients.filter((ing) => ing.id !== id),
    }));
  },

  clearError: () => set({ error: null }),
}));

// Costing Recipes Store
export const useCostingRecipesStore = create<CostingRecipesStore>((set, get) => ({
  // Initial state
  recipes: [],
  recipeDetails: {},
  isLoading: false,
  error: null,

  // Fetch all costing recipes
  fetchRecipes: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('costing_recipes')
        .select(`
          *,
          costing_recipe_ingredients (
            id,
            ingredient_id,
            quantity,
            unit,
            price_per_unit_snapshot,
            cost,
            created_at,
            master_ingredients!inner (
              ingredient_name
            )
          )
        `)
        .order('date_created', { ascending: false });

      if (error) throw error;

      // Transform data to populate both recipes and recipeDetails
      const recipes = data || [];
      const recipeDetailsMap: Record<string, CostingRecipeWithIngredients> = {};

      recipes.forEach((recipe: CostingRecipe & { costing_recipe_ingredients?: Array<{ master_ingredients: { ingredient_name: string }; [key: string]: unknown }> }) => {
        // Transform ingredients to include ingredient_name at top level
        const ingredients = recipe.costing_recipe_ingredients?.map((item: { master_ingredients: { ingredient_name: string }; [key: string]: unknown }) => {
          const { master_ingredients, ...rest } = item;
          return {
            ...rest,
            ingredient_name: master_ingredients.ingredient_name,
          } as CostingRecipeIngredient;
        }) || [];

        // Populate recipeDetails cache
        recipeDetailsMap[recipe.id] = {
          ...recipe,
          ingredients,
        };
      });

      set({
        recipes,
        recipeDetails: recipeDetailsMap, // Pre-populate cache!
        isLoading: false
      });
    } catch (err) {
      console.error('Error fetching costing recipes:', err);
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
        .from('costing_recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (recipeError) {
        if (recipeError.code === 'PGRST116') {
          set({
            error: 'Recipe not found',
            isLoading: false,
          });
          return;
        }
        throw recipeError;
      }

      // Fetch ingredients with master ingredient details
      const { data: ingredientsData, error: ingredientsError } = await supabase
        .from('costing_recipe_ingredients')
        .select(`
          *,
          master_ingredients!inner (
            ingredient_name
          )
        `)
        .eq('recipe_id', id);

      if (ingredientsError) throw ingredientsError;

      // Transform the data to include ingredient_name at the top level
      const ingredients = ingredientsData?.map((item: { master_ingredients: { ingredient_name: string }; [key: string]: unknown }) => ({
        ...item,
        ingredient_name: item.master_ingredients.ingredient_name,
      })) || [];

      const recipeWithIngredients: CostingRecipeWithIngredients = {
        ...recipeData,
        ingredients,
      };

      set((state) => ({
        recipeDetails: {
          ...state.recipeDetails,
          [id]: recipeWithIngredients,
        },
        isLoading: false,
      }));
    } catch (err) {
      console.error('Error fetching costing recipe:', err);
      set({
        error: err instanceof Error ? err.message : 'Failed to load recipe',
        isLoading: false,
      });
    }
  },

  addRecipe: (recipe: CostingRecipe) => {
    set((state) => ({
      recipes: [recipe, ...state.recipes],
    }));
  },

  updateRecipe: (id: string, recipe: CostingRecipe) => {
    set((state) => ({
      recipes: state.recipes.map((r) => (r.id === id ? recipe : r)),
      // Clear cached detail so it refetches
      recipeDetails: Object.fromEntries(
        Object.entries(state.recipeDetails).filter(([key]) => key !== id)
      ),
    }));
  },

  removeRecipe: (id: string) => {
    set((state) => ({
      recipes: state.recipes.filter((r) => r.id !== id),
    }));
  },

  clearError: () => set({ error: null }),
}));

// Suppliers Store
interface SuppliersStore {
  // State
  suppliers: Supplier[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchSuppliers: () => Promise<void>;
  addSupplier: (supplier: Supplier) => void;
  clearError: () => void;
}

export const useSuppliersStore = create<SuppliersStore>((set) => ({
  // Initial state
  suppliers: [],
  isLoading: false,
  error: null,

  // Fetch all suppliers
  fetchSuppliers: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('supplier_name', { ascending: true });

      if (error) throw error;

      set({ suppliers: data || [], isLoading: false });
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      set({
        error: err instanceof Error ? err.message : 'Failed to load suppliers',
        isLoading: false,
      });
    }
  },

  addSupplier: (supplier: Supplier) => {
    set((state) => ({
      suppliers: [...state.suppliers, supplier].sort((a, b) =>
        a.supplier_name.localeCompare(b.supplier_name)
      ),
    }));
  },

  clearError: () => set({ error: null }),
}));

// Helper function to calculate current recipe cost using live master ingredient prices
export function calculateCurrentRecipeCost(
  recipeIngredients: CostingRecipeIngredient[],
  masterIngredients: MasterIngredient[]
): number {
  return recipeIngredients.reduce((total, ing) => {
    const master = masterIngredients.find(m => m.id === ing.ingredient_id);
    return total + (ing.quantity * (master?.price_per_unit || 0));
  }, 0);
}

// Helper function to calculate profit
export function calculateProfit(
  sellPrice: number | undefined,
  totalCost: number
): number | null {
  if (sellPrice === undefined || sellPrice === null) {
    return null;
  }
  return sellPrice - totalCost;
}

// Helper function to calculate cost percentage
export function calculateCostPercentage(
  totalCost: number,
  sellPrice: number | undefined
): number | null {
  if (sellPrice === undefined || sellPrice === null || sellPrice === 0) {
    return null;
  }
  return (totalCost / sellPrice) * 100;
}
