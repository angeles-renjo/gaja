'use client';

import { useCostingRecipe } from '@/hooks/useCostingRecipe';
import { useMasterIngredients } from '@/hooks/useMasterIngredients';
import { calculateCurrentRecipeCost, calculateProfit, calculateCostPercentage } from '@/stores/costing-store';

interface RecipeDetailModalProps {
  recipeId: string;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export default function RecipeDetailModal({
  recipeId,
  isOpen,
  onClose,
  onEdit,
}: RecipeDetailModalProps) {
  const { recipe, isLoading, error } = useCostingRecipe(recipeId);
  const { ingredients: masterIngredients } = useMasterIngredients();

  // Calculate current cost using live master ingredient prices
  const currentCost = recipe ? calculateCurrentRecipeCost(recipe.ingredients, masterIngredients) : 0;
  const currentCostPerServing = recipe?.servings ? currentCost / recipe.servings : 0;

  // Calculate profit and cost percentage
  const profit = recipe ? calculateProfit(recipe.sell_price, currentCost) : null;
  const costPercentage = recipe ? calculateCostPercentage(currentCost, recipe.sell_price) : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Recipe Details</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
              title="Edit recipe"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading recipe...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-bold text-red-600 mb-2">Error</h3>
              <p className="text-gray-600">{error}</p>
            </div>
          ) : !recipe ? (
            <div className="text-center py-16">
              <p className="text-gray-600">Recipe not found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Recipe Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Recipe Name</label>
                  <div className="text-lg font-bold text-gray-900">{recipe.recipe_name}</div>
                </div>
                {recipe.servings && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Servings</label>
                    <div className="text-lg font-bold text-gray-900">{recipe.servings}</div>
                  </div>
                )}
              </div>

              {/* Ingredients Table */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Ingredients</label>

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
                  <div className="w-24 text-right">
                    <span className="text-xs font-semibold text-gray-700 uppercase">Cost</span>
                  </div>
                </div>

                {/* Ingredient Rows */}
                <div className="space-y-2">
                  {recipe.ingredients.map((ing) => {
                    const masterIng = masterIngredients.find(m => m.id === ing.ingredient_id);
                    const currentIngCost = ing.quantity * (masterIng?.price_per_unit || 0);
                    return (
                      <div
                        key={ing.id}
                        className="flex gap-3 items-center p-3 border border-gray-200 rounded-lg bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{ing.ingredient_name}</div>
                          <div className="text-xs text-gray-500">
                            ${(masterIng?.price_per_unit || 0).toFixed(4)}/{ing.unit}
                          </div>
                        </div>
                        <div className="w-28">
                          <div className="text-sm text-gray-900">{ing.quantity.toFixed(2)}</div>
                        </div>
                        <div className="w-16">
                          <span className="text-sm text-gray-700 font-medium">{ing.unit}</span>
                        </div>
                        <div className="w-24 text-right">
                          <div className="text-sm font-semibold text-gray-900">
                            ${currentIngCost.toFixed(6)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cost Summary */}
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-primary-700">Total Cost:</span>
                  <span className="text-lg font-bold text-primary-700">
                    ${currentCost.toFixed(2)}
                  </span>
                </div>
                {recipe.servings && (
                  <div className="flex items-center justify-between border-t border-primary-200 pt-2">
                    <span className="text-sm font-medium text-primary-700">Cost per Serving:</span>
                    <span className="text-lg font-bold text-primary-700">
                      ${currentCostPerServing.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-primary-200 pt-2">
                  <span className="text-sm font-medium text-primary-700">Profit:</span>
                  <span className={`text-lg font-bold ${profit !== null && profit >= 0 ? 'text-green-600' : profit !== null ? 'text-red-600' : 'text-gray-400'}`}>
                    {profit !== null ? `$${profit.toFixed(2)}` : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-primary-200 pt-2">
                  <span className="text-sm font-medium text-primary-700">Cost %:</span>
                  <span className={`text-lg font-bold ${costPercentage !== null ? (costPercentage >= 25 ? 'text-red-600' : 'text-green-600') : 'text-gray-400'}`}>
                    {costPercentage !== null ? `${costPercentage.toFixed(2)}%${costPercentage >= 25 ? ' (Over Food Cost)' : ''}` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
