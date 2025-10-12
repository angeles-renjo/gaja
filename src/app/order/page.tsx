'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMenu } from '@/hooks/useMenu';
import { useTableInfo } from '@/hooks/useTableInfo';
import Menu from '@/components/Menu';
import Cart from '@/components/Cart';
import OrderConfirmation from '@/components/OrderConfirmation';

export default function OrderPage() {
  const searchParams = useSearchParams();
  const tableId = searchParams.get('table');

  const [orderComplete, setOrderComplete] = useState(false);

  const { menuItems, isLoading: menuLoading, error: menuError } = useMenu();
  const { tableNumber, isLoading: tableLoading, error: tableError } = useTableInfo(tableId);

  const handleOrderSuccess = () => {
    setOrderComplete(true);
  };

  const handleOrderAgain = () => {
    setOrderComplete(false);
  };

  // Error states
  if (!tableId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Invalid QR Code</h1>
          <p className="text-gray-600">Please scan a valid table QR code</p>
        </div>
      </div>
    );
  }

  if (tableError || menuError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {process.env.NEXT_PUBLIC_RESTAURANT_NAME || 'Restaurant'}
          </h1>
          {tableNumber && (
            <p className="text-sm text-gray-600">Table #{tableNumber}</p>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            <Menu items={menuItems} />
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <Cart onOrderSuccess={handleOrderSuccess} />
          </div>
        </div>
      </div>
    </div>
  );
}
