'use client';

import { useState } from 'react';
import { createCostingRecipe } from '@/actions/costing';
import { useCostingRecipesStore } from '@/stores/costing-store';
import { useMasterIngredients } from '@/hooks/useMasterIngredients';

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RecipeIngredient {
  ingredient_id: string;
  ingredient_name: string;
  quantity: string;
  unit: 'g' | 'mL';
  price_per_unit: number;
}

export default function AddRecipeModal({ isOpen, onClose }: AddRecipeModalProps) {
  const [formData, setFormData] = useState({
    recipe_name: '',
    servings: '',
  });
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { ingredients: masterIngredients } = useMasterIngredients();
  const addRecipe = useCostingRecipesStore((state) => state.addRecipe);

  // Filter master ingredients based on search query
  const filteredMasterIngredients = masterIngredients.filter((ing) =>
    ing.ingredient_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddIngredient = (masterIngredient: typeof masterIngredients[0]) => {
    // Check if ingredient already added
    const alreadyAdded = ingredients.some((ing) => ing.ingredient_id === masterIngredient.id);
    if (alreadyAdded) {
      setError('This ingredient is already added');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setIngredients([
      ...ingredients,
      {
        ingredient_id: masterIngredient.id,
        ingredient_name: masterIngredient.ingredient_name,
        quantity: '',
        unit: masterIngredient.unit,
        price_per_unit: masterIngredient.price_per_unit,
      },
    ]);
    setSearchQuery(''); // Clear search after adding
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = {
      ...newIngredients[index],
      quantity: value,
    };
    setIngredients(newIngredients);
  };

  const calculateTotalCost = () => {
    return ingredients.reduce((total, ing) => {
      const quantity = parseFloat(ing.quantity) || 0;
      return total + quantity * ing.price_per_unit;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (ingredients.length === 0) {
      setError('Please add at least one ingredient');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await createCostingRecipe({
        recipe_name: formData.recipe_name,
        servings: formData.servings ? parseInt(formData.servings) : undefined,
        ingredients: ingredients.map((ing) => ({
          ingredient_id: ing.ingredient_id,
          quantity: parseFloat(ing.quantity),
          unit: ing.unit,
        })),
      });

      if (result.success && result.data) {
        addRecipe(result.data);
        setFormData({ recipe_name: '', servings: '' });
        setIngredients([]);
        onClose();
      } else {
        setError(result.error || 'Failed to create recipe');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ recipe_name: '', servings: '' });
      setIngredients([]);
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  const totalCost = calculateTotalCost();
  const costPerServing = formData.servings ? totalCost / parseInt(formData.servings) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Add Food Cost Recipe</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Recipe Name and Servings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="recipe_name" className="block text-sm font-medium text-gray-700 mb-1">
                Recipe Name *
              </label>
              <input
                type="text"
                id="recipe_name"
                required
                value={formData.recipe_name}
                onChange={(e) => setFormData({ ...formData, recipe_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Beef Teriyaki"
              />
            </div>
            <div>
              <label htmlFor="servings" className="block text-sm font-medium text-gray-700 mb-1">
                Servings (optional)
              </label>
              <input
                type="number"
                id="servings"
                min="1"
                value={formData.servings}
                onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="4"
              />
            </div>
          </div>

          {/* Ingredients Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Ingredients *</label>

            {/* Search Bar */}
            <div className="relative mb-3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search ingredients to add..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Available Ingredients List - Only show when searching */}
            {searchQuery && (
              <div className="border border-gray-300 rounded-lg mb-4 max-h-48 overflow-y-auto">
                {filteredMasterIngredients.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    {masterIngredients.length === 0
                      ? 'No master ingredients available. Add ingredients in the Master List tab first.'
                      : `No ingredients match "${searchQuery}"`}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredMasterIngredients.map((masterIng) => {
                      const isAdded = ingredients.some((ing) => ing.ingredient_id === masterIng.id);
                      return (
                        <button
                          key={masterIng.id}
                          type="button"
                          onClick={() => handleAddIngredient(masterIng)}
                          disabled={isAdded}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                            isAdded ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
                          }`}
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm">
                              {masterIng.ingredient_name}
                              {isAdded && (
                                <span className="ml-2 text-xs text-green-600">(Added)</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              ${masterIng.price_per_unit.toFixed(4)}/{masterIng.unit}
                            </div>
                          </div>
                          {!isAdded && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="w-5 h-5 text-primary-600"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 4.5v15m7.5-7.5h-15"
                              />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Selected Ingredients */}
            {ingredients.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-3">
                  Selected Ingredients ({ingredients.length})
                </label>

                {/* Table Headers */}
                <div className="flex gap-3 items-center px-3 pb-2 border-b border-gray-300 mb-2">
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-gray-700 uppercase">Name</span>
                  </div>
                  <div className="w-28">
                    <span className="text-xs font-semibold text-gray-700 uppercase">Quantity</span>
                  </div>
                  <div className="w-16">
                    <span className="text-xs font-semibold text-gray-700 uppercase">Unit</span>
                  </div>
                  <div className="w-20 text-right">
                    <span className="text-xs font-semibold text-gray-700 uppercase">Cost</span>
                  </div>
                  <div className="w-9">
                    {/* Spacer for remove button */}
                  </div>
                </div>

                {/* Ingredient Rows */}
                <div className="space-y-2">
                  {ingredients.map((ing, index) => (
                    <div
                      key={index}
                      className="flex gap-3 items-center p-3 border border-gray-200 rounded-lg bg-white"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {ing.ingredient_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          ${ing.price_per_unit.toFixed(4)}/{ing.unit}
                        </div>
                      </div>
                      <div className="w-28">
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          required
                          value={ing.quantity}
                          onChange={(e) => handleQuantityChange(index, e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="w-16">
                        <span className="text-sm text-gray-700 font-medium">{ing.unit}</span>
                      </div>
                      <div className="w-20 text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          ${((parseFloat(ing.quantity) || 0) * ing.price_per_unit).toFixed(2)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(index)}
                        className="text-red-500 hover:text-red-700 p-1 w-9 flex items-center justify-center"
                        title="Remove ingredient"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cost Summary */}
          {ingredients.length > 0 && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary-700">Total Cost:</span>
                <span className="text-lg font-bold text-primary-700">${totalCost.toFixed(2)}</span>
              </div>
              {formData.servings && parseInt(formData.servings) > 0 && (
                <div className="flex items-center justify-between border-t border-primary-200 pt-2">
                  <span className="text-sm font-medium text-primary-700">Cost per Serving:</span>
                  <span className="text-lg font-bold text-primary-700">
                    ${costPerServing.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || ingredients.length === 0}
              className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
