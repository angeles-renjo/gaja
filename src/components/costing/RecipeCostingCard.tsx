'use client';

import type { CostingRecipe } from '@/stores/costing-store';
import { useCostingRecipesStore, calculateCurrentRecipeCost } from '@/stores/costing-store';
import { useMasterIngredients } from '@/hooks/useMasterIngredients';

interface RecipeCostingCardProps {
  recipe: CostingRecipe;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function RecipeCostingCard({ recipe, onView, onEdit, onDelete }: RecipeCostingCardProps) {
  const recipeDetails = useCostingRecipesStore((state) => state.recipeDetails[recipe.id]);
  const { ingredients: masterIngredients } = useMasterIngredients();

  // Calculate current cost if we have recipe details loaded
  const currentCost = recipeDetails
    ? calculateCurrentRecipeCost(recipeDetails.ingredients, masterIngredients)
    : recipe.total_cost; // Fallback to snapshot cost

  const currentCostPerServing = recipe.servings ? currentCost / recipe.servings : undefined;

  return (
    <div className="relative group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="p-6">
        {/* Header with Edit/Delete buttons */}
        <div className="flex items-start justify-between mb-4">
          <h3
            onClick={onView}
            className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors cursor-pointer flex-1"
          >
            {recipe.recipe_name}
          </h3>
          <div className="flex gap-2 ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              title="View recipe details"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
              title="Edit recipe"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Delete recipe"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total Cost:</span>
            <span className="font-bold text-lg text-gray-900">
              ${currentCost.toFixed(2)}
            </span>
          </div>

          {recipe.servings && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Servings:</span>
                <span className="font-semibold text-gray-900">{recipe.servings}</span>
              </div>
              <div className="flex items-center justify-between text-sm bg-primary-50 -mx-6 px-6 py-2">
                <span className="text-primary-700 font-medium">Cost per Serving:</span>
                <span className="font-bold text-primary-700">
                  ${currentCostPerServing?.toFixed(2) || '0.00'}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Date Created */}
        <div className="mt-4 text-xs text-gray-400">
          Created: {new Date(recipe.date_created).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
