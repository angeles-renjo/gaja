'use client';

import { useOrders } from '@/hooks/useOrders';

export default function AdminPage() {
  const { orders, isLoading, error } = useOrders();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
          <p className="text-sm text-gray-600 mt-1">View all orders (newest first)</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        )}

        {/* Orders List */}
        {!isLoading && orders.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500">No orders found</p>
          </div>
        )}

        {!isLoading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
                {/* Order Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Table #{order.table_number}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Order ID: {order.id.slice(0, 8)}...
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      ${order.total_amount.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Items:</h4>
                  <div className="space-y-2">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div>
                          <span className="text-gray-900">
                            {item.quantity}x {item.menu_item_name}
                          </span>
                          {item.special_instructions && (
                            <p className="text-xs text-gray-500 italic">
                              Note: {item.special_instructions}
                            </p>
                          )}
                        </div>
                        <span className="text-gray-600">
                          ${(item.price_at_order * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
