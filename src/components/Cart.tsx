'use client';

import { useCartStore } from '@/stores/cart-store';
import { useSubmitOrder } from '@/hooks/useSubmitOrder';

interface CartProps {
  onOrderSuccess: () => void;
}

export default function Cart({ onOrderSuccess }: CartProps) {
  const { items, updateQuantity, removeItem, getTotalAmount, getItemCount } = useCartStore();
  const { submitOrder, isSubmitting, error } = useSubmitOrder();

  const handleSubmitOrder = async () => {
    const orderId = await submitOrder();
    if (orderId) {
      onOrderSuccess();
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-16 h-16 mx-auto text-gray-300 mb-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
          />
        </svg>
        <p className="text-gray-500 text-lg">Your cart is empty</p>
        <p className="text-gray-400 text-sm mt-2">Add items from the menu to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Cart Items */}
      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div key={item.menuItem.id} className="border-b pb-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-primary-900">{item.menuItem.name}</h3>
                <p className="text-sm text-gray-600">
                  ${item.menuItem.price.toFixed(2)} each
                </p>
                {item.specialInstructions && (
                  <p className="text-xs text-gray-500 italic mt-1">
                    Note: {item.specialInstructions}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => updateQuantity(item.menuItem.id, Math.max(1, item.quantity - 1))}
                  className="w-8 h-8 bg-primary-100 rounded-md hover:bg-primary-200 text-primary-800"
                >
                  -
                </button>
                <span className="w-8 text-center font-semibold text-primary-900">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                  className="w-8 h-8 bg-primary-100 rounded-md hover:bg-primary-200 text-primary-800"
                >
                  +
                </button>
                <button
                  onClick={() => removeItem(item.menuItem.id)}
                  className="ml-2 text-primary-600 hover:text-primary-800"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="text-right mt-1 font-semibold text-primary-800">
              ${(item.menuItem.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="border-t pt-4 mb-4">
        <div className="flex justify-between text-xl font-bold text-primary-900">
          <span>Total:</span>
          <span>${getTotalAmount().toFixed(2)}</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-primary-50 border border-primary-200 text-primary-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSubmitOrder}
          disabled={isSubmitting}
          className="flex-1 bg-success-500 text-white py-3 px-6 rounded-md hover:bg-success-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-lg transition-colors"
        >
          {isSubmitting ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
}
