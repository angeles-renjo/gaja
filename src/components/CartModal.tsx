'use client';

import { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import Cart from './Cart';

interface CartModalProps {
  onOrderSuccess: () => void;
}

export interface CartModalHandle {
  open: () => void;
  close: () => void;
}

const CartModal = forwardRef<CartModalHandle, CartModalProps>(
  ({ onOrderSuccess }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    // Expose open/close methods to parent
    useImperativeHandle(ref, () => ({
      open: () => {
        dialogRef.current?.showModal();
      },
      close: () => {
        dialogRef.current?.close();
      },
    }));

    // Handle backdrop click (click outside modal)
    useEffect(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;

      const handleClick = (e: MouseEvent) => {
        const rect = dialog.getBoundingClientRect();
        const isInDialog =
          rect.top <= e.clientY &&
          e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX &&
          e.clientX <= rect.left + rect.width;

        if (!isInDialog) {
          dialog.close();
        }
      };

      dialog.addEventListener('click', handleClick);
      return () => dialog.removeEventListener('click', handleClick);
    }, []);

    const handleClose = () => {
      dialogRef.current?.close();
    };

    const handleOrderSuccess = () => {
      dialogRef.current?.close();
      onOrderSuccess();
    };

    return (
      <dialog
        ref={dialogRef}
        className="backdrop:bg-black/50 backdrop:backdrop-blur-sm bg-transparent p-0 max-w-full w-full md:max-w-lg md:w-auto rounded-none md:rounded-lg shadow-2xl"
      >
        {/* Modal Content */}
        <div className="bg-white h-screen md:h-auto md:max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
            <h2 className="text-2xl font-bold text-primary-900">Your Cart</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close cart"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6 text-gray-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Cart Contents (scrollable) */}
          <div className="flex-1 overflow-y-auto p-4">
            <Cart onOrderSuccess={handleOrderSuccess} />
          </div>
        </div>
      </dialog>
    );
  }
);

CartModal.displayName = 'CartModal';

export default CartModal;
