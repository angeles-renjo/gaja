'use client';

import { useCartStore } from '@/stores/cart-store';

interface BottomCheckoutBarProps {
  onOpenCart: () => void;
}

export default function BottomCheckoutBar({ onOpenCart }: BottomCheckoutBarProps) {
  const { getItemCount, getTotalAmount } = useCartStore();
  const itemCount = getItemCount();
  const total = getTotalAmount();

  // Don't render if cart is empty
  if (itemCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-20 safe-area-padding-bottom">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <button
          onClick={onOpenCart}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-colors flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
            <span>Finish Order ({itemCount} items)</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="font-bold">${total.toFixed(2)}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}
