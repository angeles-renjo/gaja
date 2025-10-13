'use client';

import { useState } from 'react';
import { useCartStore } from '@/stores/cart-store';
import { useSubmitOrder } from '@/hooks/useSubmitOrder';
import ImageModal from './ImageModal';
import Accordion from './Accordion';

interface CartProps {
  onOrderSuccess: () => void;
}

export default function Cart({ onOrderSuccess }: CartProps) {
  const { items, updateQuantity, removeItem, getTotalAmount, getItemCount } = useCartStore();
  const { submitOrder, isSubmitting, error } = useSubmitOrder();
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);

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
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.menuItem.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            {/* Horizontal Layout: Image + Content */}
            <div className="mb-3 flex gap-4">
              {/* Clickable Image Thumbnail */}
              {item.menuItem.image_url ? (
                <button
                  onClick={() =>
                    setSelectedImage({
                      src: item.menuItem.image_url!,
                      alt: item.menuItem.name,
                    })
                  }
                  className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg transition-opacity hover:opacity-80"
                >
                  <img
                    src={item.menuItem.image_url}
                    alt={item.menuItem.name}
                    className="h-full w-full object-cover"
                  />
                </button>
              ) : (
                <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-8 h-8 text-gray-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                </div>
              )}

              {/* Title, Description, and Price */}
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg leading-tight text-primary-900">
                      {item.menuItem.name}
                    </h3>
                    <span className="flex-shrink-0 font-mono text-lg font-bold text-primary-600">
                      ${item.menuItem.price.toFixed(2)}
                    </span>
                  </div>
                  {item.menuItem.description && (
                    <p className="text-sm leading-relaxed text-gray-600">
                      {item.menuItem.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            {item.specialInstructions && (
              <div className="mb-3 rounded-md border border-primary-100 bg-primary-50 px-3 py-2">
                <p className="text-xs font-medium text-primary-700">
                  <span className="font-semibold">Note:</span> {item.specialInstructions}
                </p>
              </div>
            )}

            {/* Allergies Section */}
            {item.menuItem.allergies && item.menuItem.allergies.length > 0 && (
              <div className="mb-3 rounded-md border border-accent-300 bg-accent-100 p-2.5">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-3.5 w-3.5 text-accent-700"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                  <span className="text-xs font-semibold uppercase tracking-wide text-accent-700">
                    Allergies
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {item.menuItem.allergies.map((allergy, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-accent-200 px-2 py-0.5 text-xs font-medium text-gray-900"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredients Accordion */}
            {item.menuItem.ingredients && item.menuItem.ingredients.length > 0 && (
              <div className="mb-3">
                <Accordion
                  trigger={
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-4 w-4 text-gray-600"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                        />
                      </svg>
                      <span>View Ingredients</span>
                    </div>
                  }
                >
                  <ul className="space-y-1 text-sm text-gray-600">
                    {item.menuItem.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary-500" />
                        <span className="leading-relaxed">{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </Accordion>
              </div>
            )}

            {/* Quantity Controls and Remove Button */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.menuItem.id, Math.max(1, item.quantity - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-100 text-primary-800 transition-colors hover:bg-primary-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-4 w-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                  </svg>
                </button>
                <span className="w-8 text-center font-semibold text-primary-900">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-100 text-primary-800 transition-colors hover:bg-primary-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-4 w-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-lg font-bold text-primary-800">
                  ${(item.menuItem.price * item.quantity).toFixed(2)}
                </span>
                <button
                  onClick={() => removeItem(item.menuItem.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-primary-600 transition-colors hover:bg-primary-50 hover:text-primary-800"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-5 w-5"
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

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          src={selectedImage.src}
          alt={selectedImage.alt}
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
