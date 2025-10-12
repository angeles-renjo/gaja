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
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
        <p className="text-gray-500 text-center py-8">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
      <h2 className="text-2xl font-bold mb-4">
        Your Cart ({getItemCount()} items)
      </h2>

      {/* Cart Items */}
      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div key={item.menuItem.id} className="border-b pb-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold">{item.menuItem.name}</h3>
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
                  className="w-8 h-8 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  -
                </button>
                <span className="w-8 text-center font-semibold">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                  className="w-8 h-8 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  +
                </button>
                <button
                  onClick={() => removeItem(item.menuItem.id)}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="text-right mt-1 font-semibold">
              ${(item.menuItem.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="border-t pt-4 mb-4">
        <div className="flex justify-between text-xl font-bold">
          <span>Total:</span>
          <span>${getTotalAmount().toFixed(2)}</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmitOrder}
        disabled={isSubmitting}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-lg transition-colors"
      >
        {isSubmitting ? 'Submitting...' : 'Place Order'}
      </button>
    </div>
  );
}
