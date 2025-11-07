'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import IngredientInput from './IngredientInput';
import { RecipeFormData, RecipeWithIngredients } from '@/types';
import { useCreateRecipe, useUpdateRecipe } from '@/hooks/useRecipeMutations';

interface RecipeFormProps {
  mode: 'create' | 'edit';
  initialData?: RecipeWithIngredients;
}

export default function RecipeForm({ mode, initialData }: RecipeFormProps) {
  const router = useRouter();
  const { createRecipe, isLoading: isCreating } = useCreateRecipe();
  const { updateRecipe, isLoading: isUpdating } = useUpdateRecipe();

  const [formData, setFormData] = useState<RecipeFormData>({
    name: initialData?.name || '',
    instructions: initialData?.instructions || '',
    ingredients: initialData?.ingredients.map(ing => ({
      ingredient_name: ing.ingredient_name,
      weight: ing.weight,
    })) || [{ ingredient_name: '', weight: '' }],
  });

  const handleIngredientChange = (index: number, field: 'ingredient_name' | 'weight', value: string) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index][field] = value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { ingredient_name: '', weight: '' }],
    });
  };

  const removeIngredient = (index: number) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
      setFormData({ ...formData, ingredients: newIngredients });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that all ingredients have both name and weight
    const hasEmptyIngredients = formData.ingredients.some(
      ing => !ing.ingredient_name.trim() || !ing.weight.trim()
    );

    if (hasEmptyIngredients) {
      toast.error('Please fill in all ingredient fields or remove empty ones.');
      return;
    }

    let result;
    if (mode === 'create') {
      result = await createRecipe(formData);
    } else if (initialData) {
      result = await updateRecipe(initialData.id, formData);
    }

    if (result?.success) {
      toast.success(mode === 'create' ? 'Recipe created successfully!' : 'Recipe updated successfully!');
      router.push('/recipes');
    } else {
      toast.error(result?.error || 'Failed to save recipe');
    }
  };

  const handleCancel = () => {
    router.push('/recipes');
  };

  const isLoading = isCreating || isUpdating;

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      {/* Recipe Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-black mb-2">
          Recipe Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg text-black"
          placeholder="e.g., Chocolate Chip Cookies"
          required
        />
      </div>

      {/* Ingredients Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-semibold text-gray-700">
            Ingredients
          </label>
          <button
            type="button"
            onClick={addIngredient}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Add Ingredient
          </button>
        </div>

        <div className="space-y-3 rounded-lg">
          {formData.ingredients.map((ingredient, index) => (
            <IngredientInput
              key={index}
              index={index}
              ingredientName={ingredient.ingredient_name}
              weight={ingredient.weight}
              onIngredientChange={handleIngredientChange}
              onRemove={removeIngredient}
              canRemove={formData.ingredients.length > 1}
            />
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div>
        <label htmlFor="instructions" className="block text-sm font-semibold text-gray-700 mb-2">
          Instructions
        </label>
        <textarea
          id="instructions"
          value={formData.instructions}
          onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-gray-700"
          placeholder="Step-by-step cooking instructions..."
          rows={8}
          required
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-primary-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Saving...' : mode === 'create' ? 'Create Recipe' : 'Update Recipe'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isLoading}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
