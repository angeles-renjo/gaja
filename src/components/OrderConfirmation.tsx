'use client';

import { useOrderStore } from '@/stores/order-store';

interface OrderConfirmationProps {
  onOrderAgain: () => void;
}

export default function OrderConfirmation({ onOrderAgain }: OrderConfirmationProps) {
  const { currentOrderId, tableNumber } = useOrderStore();

  return (
    <div className="max-w-md mx-auto mt-12 text-center">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-10 h-10 text-success-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Order Placed Successfully!
        </h2>

        <p className="text-gray-600 mb-6">
          Your order has been sent to the kitchen
        </p>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          {tableNumber && (
            <p className="text-sm text-gray-600 mb-2">
              Table: <span className="font-semibold">#{tableNumber}</span>
            </p>
          )}
          {currentOrderId && (
            <p className="text-xs text-gray-500">
              Order ID: {currentOrderId.slice(0, 8)}...
            </p>
          )}
        </div>

        {/* Order Again Button */}
        <button
          onClick={onOrderAgain}
          className="w-full bg-primary-500 text-white py-3 px-6 rounded-md hover:bg-primary-600 transition-colors font-semibold"
        >
          Order Again
        </button>

        <p className="text-xs text-gray-500 mt-4">
          Your food will be ready shortly
        </p>
      </div>
    </div>
  );
}
