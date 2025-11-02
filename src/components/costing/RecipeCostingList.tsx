'use client';

import { useState } from 'react';
import { useCostingRecipes } from '@/hooks/useCostingRecipes';
import RecipeCostingCard from './RecipeCostingCard';
import AddRecipeModal from './AddRecipeModal';
import RecipeDetailModal from './RecipeDetailModal';
import DeleteRecipeModal from './DeleteRecipeModal';
import EditRecipeModal from './EditRecipeModal';

export default function RecipeCostingList() {
  const { recipes, isLoading, error } = useCostingRecipes();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [recipeModal, setRecipeModal] = useState<{
    recipeId: string;
    mode: 'view' | 'edit';
  } | null>(null);
  const [deletingRecipeId, setDeletingRecipeId] = useState<string | null>(null);

  // Filter recipes based on search query
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.recipe_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recipes...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Search Bar and Add Button */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
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
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
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
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors shadow-sm"
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
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Add Food Cost
        </button>
      </div>

      {recipes.length === 0 ? (
        // Empty State - No recipes at all
        <div className="text-center py-16">
          <div className="mb-6 inline-flex rounded-full bg-gray-100 p-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-12 h-12 text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No recipes yet</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first costing recipe</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
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
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Add Food Cost
          </button>
        </div>
      ) : filteredRecipes.length === 0 ? (
        // Empty State - No search results
        <div className="text-center py-16">
          <div className="mb-6 inline-flex rounded-full bg-gray-100 p-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-12 h-12 text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No recipes found</h3>
          <p className="text-gray-600 mb-6">
            No recipes match &quot;{searchQuery}&quot;. Try a different search term.
          </p>
        </div>
      ) : (
        // Recipe Cards Grid
        <div>
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredRecipes.length} of {recipes.length} recipe
            {recipes.length !== 1 ? 's' : ''}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCostingCard
                key={recipe.id}
                recipe={recipe}
                onView={() => setRecipeModal({ recipeId: recipe.id, mode: 'view' })}
                onEdit={() => setRecipeModal({ recipeId: recipe.id, mode: 'edit' })}
                onDelete={() => setDeletingRecipeId(recipe.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <AddRecipeModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      {recipeModal && (
        <>
          <RecipeDetailModal
            recipeId={recipeModal.recipeId}
            isOpen={recipeModal.mode === 'view'}
            onClose={() => setRecipeModal(null)}
            onEdit={() => setRecipeModal({ recipeId: recipeModal.recipeId, mode: 'edit' })}
          />
          <EditRecipeModal
            recipeId={recipeModal.recipeId}
            isOpen={recipeModal.mode === 'edit'}
            onClose={() => setRecipeModal(null)}
          />
        </>
      )}
      {deletingRecipeId && (
        <DeleteRecipeModal
          recipeId={deletingRecipeId}
          isOpen={!!deletingRecipeId}
          onClose={() => setDeletingRecipeId(null)}
        />
      )}
    </div>
  );
}
