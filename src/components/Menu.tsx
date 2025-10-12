'use client';

import { MenuItem } from '@/types';
import { useCartStore } from '@/stores/cart-store';

interface MenuProps {
  items: MenuItem[];
}

export default function Menu({ items }: MenuProps) {
  const addItem = useCartStore((state) => state.addItem);

  const foodItems = items.filter((item) => item.category === 'food');
  const beverageItems = items.filter((item) => item.category === 'beverage');

  const handleAddToCart = (item: MenuItem) => {
    addItem(item, 1);
  };

  return (
    <div className="space-y-8">
      {/* Food Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Food</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {foodItems.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {item.description}
                  </p>
                </div>
                <span className="text-lg font-bold text-green-600 ml-4">
                  ${item.price.toFixed(2)}
                </span>
              </div>
              <button
                onClick={() => handleAddToCart(item)}
                disabled={!item.available}
                className="w-full mt-3 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {item.available ? 'Add to Cart' : 'Unavailable'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Beverages Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Beverages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {beverageItems.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {item.description}
                  </p>
                </div>
                <span className="text-lg font-bold text-green-600 ml-4">
                  ${item.price.toFixed(2)}
                </span>
              </div>
              <button
                onClick={() => handleAddToCart(item)}
                disabled={!item.available}
                className="w-full mt-3 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {item.available ? 'Add to Cart' : 'Unavailable'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
