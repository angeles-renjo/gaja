'use client';

import { useState } from 'react';
import { deleteIngredient } from '@/actions/costing';
import { useMasterIngredientsStore } from '@/stores/costing-store';

interface IngredientCardProps {
  ingredient: {
    id: string;
    ingredient_name: string;
    weight: number;
    unit: string;
    purchase_price: number;
    price_per_unit: number;
    notes?: string;
    date_added: string;
  };
  onEdit: () => void;
}

export default function IngredientCard({ ingredient, onEdit }: IngredientCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const removeIngredient = useMasterIngredientsStore((state) => state.removeIngredient);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteIngredient(ingredient.id);
      if (result.success) {
        removeIngredient(ingredient.id);
        setShowDeleteConfirm(false);
      } else {
        alert(result.error || 'Failed to delete ingredient');
      }
    } catch {
      alert('Failed to delete ingredient');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
            {ingredient.ingredient_name}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
              title="Edit ingredient"
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
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Delete ingredient"
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
            <span className="text-gray-600">Weight:</span>
            <span className="font-semibold text-gray-900">
              {ingredient.weight.toLocaleString()} {ingredient.unit}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Purchase Price:</span>
            <span className="font-semibold text-gray-900">
              ${ingredient.purchase_price.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm bg-primary-50 -mx-6 px-6 py-2">
            <span className="text-primary-700 font-medium">Price per {ingredient.unit}:</span>
            <span className="font-bold text-primary-700">
              ${ingredient.price_per_unit.toFixed(4)}
            </span>
          </div>
        </div>

        {/* Notes */}
        {ingredient.notes && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 italic">{ingredient.notes}</p>
          </div>
        )}

        {/* Date Added */}
        <div className="mt-4 text-xs text-gray-400">
          Added: {new Date(ingredient.date_added).toLocaleDateString()}
        </div>
      </div>

      {/* Delete Confirmation Overlay */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-12 h-12 text-red-500 mx-auto"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Delete Ingredient?</h4>
            <p className="text-sm text-gray-600 mb-4">
              This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
