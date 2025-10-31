'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
  MasterIngredientFormData,
  CostingRecipeFormData,
} from '@/stores/costing-store';

// Master Ingredients Actions

export async function createMasterIngredient(formData: MasterIngredientFormData) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('master_ingredients')
      .insert({
        ingredient_name: formData.ingredient_name,
        weight: formData.weight,
        unit: formData.unit,
        purchase_price: formData.purchase_price,
        notes: formData.notes || null,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/costing');
    return { success: true, data };
  } catch (error) {
    console.error('Error creating master ingredient:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create ingredient',
    };
  }
}

export async function updateMasterIngredient(
  id: string,
  formData: MasterIngredientFormData
) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('master_ingredients')
      .update({
        ingredient_name: formData.ingredient_name,
        weight: formData.weight,
        unit: formData.unit,
        purchase_price: formData.purchase_price,
        notes: formData.notes || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/costing');
    return { success: true, data };
  } catch (error) {
    console.error('Error updating master ingredient:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update ingredient',
    };
  }
}

export async function deleteIngredient(id: string) {
  try {
    const supabase = await createClient();

    // Check if ingredient is used in any recipes
    const { data: usedInRecipes, error: checkError } = await supabase
      .from('costing_recipe_ingredients')
      .select('id')
      .eq('ingredient_id', id)
      .limit(1);

    if (checkError) throw checkError;

    if (usedInRecipes && usedInRecipes.length > 0) {
      return {
        success: false,
        error: 'Cannot delete ingredient that is used in recipes',
      };
    }

    const { error } = await supabase
      .from('master_ingredients')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/costing');
    return { success: true };
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete ingredient',
    };
  }
}

// Costing Recipes Actions

export async function createCostingRecipe(formData: CostingRecipeFormData) {
  try {
    const supabase = await createClient();

    // Insert recipe
    const { data: recipeData, error: recipeError } = await supabase
      .from('costing_recipes')
      .insert({
        recipe_name: formData.recipe_name,
        servings: formData.servings || null,
        total_cost: 0, // Will be calculated by triggers
      })
      .select()
      .single();

    if (recipeError) throw recipeError;

    // Get ingredient prices and insert ingredients
    if (formData.ingredients.length > 0) {
      // Fetch current prices for all ingredients
      const ingredientIds = formData.ingredients.map((ing) => ing.ingredient_id);
      const { data: masterIngredients, error: fetchError } = await supabase
        .from('master_ingredients')
        .select('id, price_per_unit')
        .in('id', ingredientIds);

      if (fetchError) throw fetchError;

      // Create a map for quick lookup
      const priceMap = new Map(
        masterIngredients?.map((ing) => [ing.id, ing.price_per_unit]) || []
      );

      // Insert ingredients with price snapshots
      const ingredientsToInsert = formData.ingredients.map((ing) => ({
        recipe_id: recipeData.id,
        ingredient_id: ing.ingredient_id,
        quantity: ing.quantity,
        unit: ing.unit,
        price_per_unit_snapshot: priceMap.get(ing.ingredient_id) || 0,
      }));

      const { error: ingredientsError } = await supabase
        .from('costing_recipe_ingredients')
        .insert(ingredientsToInsert);

      if (ingredientsError) throw ingredientsError;

      // Fetch updated recipe with calculated cost
      const { data: updatedRecipe, error: refetchError } = await supabase
        .from('costing_recipes')
        .select('*')
        .eq('id', recipeData.id)
        .single();

      if (refetchError) throw refetchError;

      revalidatePath('/costing');
      return { success: true, data: updatedRecipe };
    }

    revalidatePath('/costing');
    return { success: true, data: recipeData };
  } catch (error) {
    console.error('Error creating costing recipe:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create recipe',
    };
  }
}

export async function updateCostingRecipe(
  id: string,
  formData: CostingRecipeFormData
) {
  try {
    const supabase = await createClient();

    // Update recipe
    const { error: recipeError } = await supabase
      .from('costing_recipes')
      .update({
        recipe_name: formData.recipe_name,
        servings: formData.servings || null,
      })
      .eq('id', id);

    if (recipeError) throw recipeError;

    // Delete existing ingredients
    const { error: deleteError } = await supabase
      .from('costing_recipe_ingredients')
      .delete()
      .eq('recipe_id', id);

    if (deleteError) throw deleteError;

    // Get ingredient prices and insert new ingredients
    if (formData.ingredients.length > 0) {
      const ingredientIds = formData.ingredients.map((ing) => ing.ingredient_id);
      const { data: masterIngredients, error: fetchError } = await supabase
        .from('master_ingredients')
        .select('id, price_per_unit')
        .in('id', ingredientIds);

      if (fetchError) throw fetchError;

      const priceMap = new Map(
        masterIngredients?.map((ing) => [ing.id, ing.price_per_unit]) || []
      );

      const ingredientsToInsert = formData.ingredients.map((ing) => ({
        recipe_id: id,
        ingredient_id: ing.ingredient_id,
        quantity: ing.quantity,
        unit: ing.unit,
        price_per_unit_snapshot: priceMap.get(ing.ingredient_id) || 0,
      }));

      const { error: ingredientsError } = await supabase
        .from('costing_recipe_ingredients')
        .insert(ingredientsToInsert);

      if (ingredientsError) throw ingredientsError;
    }

    // Fetch updated recipe
    const { data: updatedRecipe, error: refetchError } = await supabase
      .from('costing_recipes')
      .select('*')
      .eq('id', id)
      .single();

    if (refetchError) throw refetchError;

    revalidatePath('/costing');
    return { success: true, data: updatedRecipe };
  } catch (error) {
    console.error('Error updating costing recipe:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update recipe',
    };
  }
}

export async function deleteCostingRecipe(id: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('costing_recipes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/costing');
    return { success: true };
  } catch (error) {
    console.error('Error deleting costing recipe:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete recipe',
    };
  }
}
