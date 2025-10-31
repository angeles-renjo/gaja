'use client';

import { useState, useEffect } from 'react';
import { useSuppliersStore } from '@/stores/costing-store';
import { createSupplier } from '@/actions/costing';

interface SupplierSelectProps {
  value: string;
  onChange: (supplierId: string) => void;
  required?: boolean;
}

export default function SupplierSelect({ value, onChange, required = false }: SupplierSelectProps) {
  const { suppliers, isLoading, fetchSuppliers } = useSuppliersStore();
  const addSupplier = useSuppliersStore((state) => state.addSupplier);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => {
    if (suppliers.length === 0 && !isLoading) {
      fetchSuppliers();
    }
  }, [suppliers.length, isLoading, fetchSuppliers]);

  const handleAddSupplier = async () => {
    if (!newSupplierName.trim()) return;

    setIsAdding(true);
    setAddError('');

    try {
      const result = await createSupplier(newSupplierName.trim());

      if (result.success && result.data) {
        addSupplier(result.data);
        onChange(result.data.id);
        setNewSupplierName('');
        setShowAddForm(false);
      } else {
        setAddError(result.error || 'Failed to add supplier');
      }
    } catch {
      setAddError('An unexpected error occurred');
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSupplier();
    } else if (e.key === 'Escape') {
      setShowAddForm(false);
      setNewSupplierName('');
      setAddError('');
    }
  };

  return (
    <div>
      <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">
        Supplier {!required && '(optional)'}
      </label>

      {!showAddForm ? (
        <div className="flex gap-2">
          <select
            id="supplier"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={isLoading}
          >
            <option value="">-- Select Supplier --</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.supplier_name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            title="Add new supplier"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newSupplierName}
              onChange={(e) => setNewSupplierName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter supplier name..."
              autoFocus
              disabled={isAdding}
              className="flex-1 px-4 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleAddSupplier}
              disabled={isAdding || !newSupplierName.trim()}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {isAdding ? 'Adding...' : 'Add'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setNewSupplierName('');
                setAddError('');
              }}
              disabled={isAdding}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
          {addError && (
            <p className="text-sm text-red-600">{addError}</p>
          )}
          <p className="text-xs text-gray-500">Press Enter to add, Esc to cancel</p>
        </div>
      )}
    </div>
  );
}
