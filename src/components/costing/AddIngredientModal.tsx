'use client';

import { useState } from 'react';
import { createMasterIngredient } from '@/actions/costing';
import { useMasterIngredientsStore } from '@/stores/costing-store';

interface AddIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddIngredientModal({ isOpen, onClose }: AddIngredientModalProps) {
  const [formData, setFormData] = useState({
    ingredient_name: '',
    weight: '',
    unit: 'g' as 'g' | 'mL' | 'ea',
    purchase_price: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addIngredient = useMasterIngredientsStore((state) => state.addIngredient);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const result = await createMasterIngredient({
        ingredient_name: formData.ingredient_name,
        weight: parseFloat(formData.weight),
        unit: formData.unit,
        purchase_price: parseFloat(formData.purchase_price),
        notes: formData.notes || undefined,
      });

      if (result.success && result.data) {
        addIngredient(result.data);
        setFormData({
          ingredient_name: '',
          weight: '',
          unit: 'g',
          purchase_price: '',
          notes: '',
        });
        onClose();
      } else {
        setError(result.error || 'Failed to add ingredient');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        ingredient_name: '',
        weight: '',
        unit: 'g',
        purchase_price: '',
        notes: '',
      });
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  const pricePerUnit =
    formData.weight && formData.purchase_price
      ? (parseFloat(formData.purchase_price) / parseFloat(formData.weight)).toFixed(4)
      : '0.0000';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Add New Ingredient</h2>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Ingredient Name */}
          <div>
            <label htmlFor="ingredient_name" className="block text-sm font-medium text-gray-700 mb-1">
              Ingredient Name *
            </label>
            <input
              type="text"
              id="ingredient_name"
              required
              value={formData.ingredient_name}
              onChange={(e) => setFormData({ ...formData, ingredient_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Soy Sauce"
            />
          </div>

          {/* Weight and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity/Amount *
              </label>
              <input
                type="number"
                id="weight"
                required
                step="0.01"
                min="0.01"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="1000"
              />
            </div>
            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                Unit *
              </label>
              <select
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value as 'g' | 'mL' | 'ea' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="g">g (grams)</option>
                <option value="mL">mL (milliliters)</option>
                <option value="ea">ea (pieces)</option>
              </select>
            </div>
          </div>

          {/* Purchase Price */}
          <div>
            <label htmlFor="purchase_price" className="block text-sm font-medium text-gray-700 mb-1">
              Purchase Price * ($)
            </label>
            <input
              type="number"
              id="purchase_price"
              required
              step="0.01"
              min="0.01"
              value={formData.purchase_price}
              onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="25.00"
            />
          </div>

          {/* Calculated Price Per Unit */}
          {formData.weight && formData.purchase_price && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary-700">
                  Price per {formData.unit}:
                </span>
                <span className="text-lg font-bold text-primary-700">${pricePerUnit}</span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="e.g., 1kg bottle from Costco"
            />
          </div>

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
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Ingredient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
