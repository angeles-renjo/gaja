'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { deleteCostingRecipe } from '@/actions/costing';
import { useCostingRecipesStore } from '@/stores/costing-store';

interface DeleteRecipeModalProps {
  recipeId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteRecipeModal({
  recipeId,
  isOpen,
  onClose,
}: DeleteRecipeModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const removeRecipe = useCostingRecipesStore((state) => state.removeRecipe);
  const recipes = useCostingRecipesStore((state) => state.recipes);

  const recipe = recipes.find((r) => r.id === recipeId);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteCostingRecipe(recipeId);
      if (result.success) {
        removeRecipe(recipeId);
        toast.success('Recipe deleted successfully!');
        onClose();
      } else {
        toast.error(result.error || 'Failed to delete recipe');
      }
    } catch {
      toast.error('Failed to delete recipe');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center">
          {/* Warning Icon */}
          <div className="mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-16 h-16 text-red-500 mx-auto"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Recipe?</h3>

          {/* Message */}
          <p className="text-gray-600 mb-2">
            Are you sure you want to delete <span className="font-semibold">&quot;{recipe?.recipe_name}&quot;</span>?
          </p>
          <p className="text-gray-500 text-sm mb-6">
            This action cannot be undone.
          </p>

          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
