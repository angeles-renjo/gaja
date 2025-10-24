'use client';

import { useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMenu } from '@/hooks/useMenu';
import { useTableInfo } from '@/hooks/useTableInfo';
import Menu from '@/components/Menu';
import CartIcon from '@/components/CartIcon';
import CartModal, { CartModalHandle } from '@/components/CartModal';
import BottomCheckoutBar from '@/components/BottomCheckoutBar';
import OrderConfirmation from '@/components/OrderConfirmation';

function OrderPageContent() {
  const searchParams = useSearchParams();
  const tableId = searchParams.get('table');

  const [orderComplete, setOrderComplete] = useState(false);
  const cartModalRef = useRef<CartModalHandle>(null);

  const { menuItems, isLoading: menuLoading, error: menuError } = useMenu();
  const { tableNumber, isLoading: tableLoading, error: tableError } = useTableInfo(tableId);

  const handleOrderSuccess = () => {
    setOrderComplete(true);
  };

  const handleOrderAgain = () => {
    setOrderComplete(false);
  };

  const handleOpenCart = () => {
    cartModalRef.current?.open();
  };

  // Error states
  if (!tableId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary-600 mb-2">Invalid QR Code</h1>
          <p className="text-gray-600">Please scan a valid table QR code</p>
        </div>
      </div>
    );
  }

  if (tableError || menuError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary-600 mb-2">Error</h1>
          <p className="text-gray-600">{tableError || menuError}</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (tableLoading || menuLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  // Order confirmation view
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <OrderConfirmation onOrderAgain={handleOrderAgain} />
      </div>
    );
  }

  // Main ordering view
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {process.env.NEXT_PUBLIC_RESTAURANT_NAME || 'Restaurant'}
              </h1>
              {tableNumber && (
                <p className="text-sm text-gray-600">Table #{tableNumber}</p>
              )}
            </div>
            {/* Cart Icon */}
            <CartIcon onClick={handleOpenCart} />
          </div>
        </div>
      </header>

      {/* Main Content - Full Width Menu */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Menu items={menuItems} />
      </div>

      {/* Cart Modal */}
      <CartModal ref={cartModalRef} onOrderSuccess={handleOrderSuccess} />

      {/* Bottom Checkout Bar */}
      <BottomCheckoutBar onOpenCart={handleOpenCart} />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OrderPageContent />
    </Suspense>
  );
}
