'use client';

import { useState } from 'react';
import { MenuItem } from '@/types';
import { useCartStore } from '@/stores/cart-store';
import ImageModal from './ImageModal';
import Accordion from './Accordion';

// Local card component to manage per-item options selection and layout
function ItemCard({ item, onAdd, onImageClick }: { item: MenuItem; onAdd: (item: MenuItem) => void; onImageClick: (img: { src: string; alt: string }) => void }) {
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());

  const LABELS: Record<string, string> = {
    vegan: 'Vegan',
    vegetarian: 'Vegetarian',
    dairy_free: 'Dairy-free',
  };

  const enabled = (item.enabled_options || []).filter((k) => k in LABELS);
  const isVegan = selectedOptions.has('vegan');

  function toggle(key: string) {
    setSelectedOptions((prev) => {
      const next = new Set(prev);
      const has = next.has(key);
      if (key === 'vegan') {
        if (has) {
          next.delete('vegan');
          // Leave dairy_free as user-set if they want
        } else {
          next.add('vegan');
          next.add('dairy_free'); // Vegan implies dairy-free
          next.delete('vegetarian'); // mutually exclusive
        }
        return next;
      }
      if (key === 'vegetarian') {
        if (has) {
          next.delete('vegetarian');
        } else {
          next.delete('vegan'); // mutually exclusive
          next.add('vegetarian');
        }
        return next;
      }
      if (key === 'dairy_free') {
        if (isVegan) {
          // When vegan is on, dairy_free is forced; ignore manual off
          return next;
        }
        if (has) next.delete('dairy_free'); else next.add('dairy_free');
        return next;
      }
      // generic toggle for any future keys
      if (has) next.delete(key); else next.add(key);
      return next;
    });
  }

  return (
    <div
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Horizontal Layout: Image + Content */}
      <div className="mb-3 flex gap-4">
        {/* Clickable Image Thumbnail */}
        {item.image_url ? (
          <button
            onClick={() => onImageClick({ src: item.image_url!, alt: item.name })}
            className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg transition-opacity hover:opacity-80"
          >
            <img
              src={item.image_url}
              alt={item.name}
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
                {item.name}
              </h3>
              <span className="flex-shrink-0 font-mono text-lg font-bold text-primary-600">
                ${item.price.toFixed(2)}
              </span>
            </div>
            {item.description && (
              <p className="text-sm leading-relaxed text-gray-600">
                {item.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Dietary + Options side-by-side on md+ */}
      {(enabled.length > 0 || (item.allergies && item.allergies.length > 0)) && (
        <div className="mb-3 md:flex md:items-start md:gap-4">
          {/* Dietary - 30% */}
          {item.allergies && item.allergies.length > 0 && (
            <div className="mb-3 md:mb-0 md:basis-[30%] md:flex-shrink-0 rounded-md border border-accent-300 bg-accent-100 p-2.5">
              <div className="mb-1.5 flex items-center gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-accent-700 px-4">
                  Dietary
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {item.allergies.map((allergy, index) => (
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

          {/* Options - 70% */}
          {enabled.length > 0 && (
            <div className="md:basis-[70%]">
              <div className="mb-1.5 flex items-center gap-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-3.5 w-3.5 text-primary-700"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                <span className="text-xs font-semibold uppercase tracking-wide text-primary-700">
                  Options
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {enabled.map((key) => {
                  const checked = selectedOptions.has(key);
                  const disabled = (isVegan && key === 'vegetarian') || (isVegan && key === 'dairy_free');
                  return (
                    <label key={key} className={`inline-flex items-center gap-2 rounded-md border px-2 py-1 text-sm text-black border-accent-700 ${disabled ? 'opacity-60' : ''}`}>
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggle(key)}
                      />
                      <span>{LABELS[key] || key}</span>
                    </label>
                  );
                })}
              </div>
              {isVegan && (
                <p className="mt-1 text-xs text-gray-500">Vegan is selected: dairy-free enforced, vegetarian disabled.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Ingredients Accordion */}
      {item.ingredients && item.ingredients.length > 0 && (
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
              {item.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary-500" />
                  <span className="leading-relaxed">{ingredient}</span>
                </li>
              ))}
            </ul>
          </Accordion>
        </div>
      )}

      {/* Add to Cart Button */}
      <button
        onClick={() => onAdd(item)}
        disabled={!item.available}
        className="w-full flex items-center justify-center gap-2 bg-primary-500 text-white py-2.5 px-4 rounded-md hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
          />
        </svg>
        {item.available ? 'Add to Cart' : 'Unavailable'}
      </button>
    </div>
  );
}

interface MenuProps {
  items: MenuItem[];
}

export default function Menu({ items }: MenuProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'food' | 'beverage'>('food');

  const foodItems = items.filter((item) => item.category === 'food');
  const beverageItems = items.filter((item) => item.category === 'beverage');

  const handleAddToCart = (item: MenuItem) => {
    addItem(item, 1);
  };

  const displayItems = activeTab === 'food' ? foodItems : beverageItems;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="sticky top-0 z-10 bg-gray-50 -mx-4 px-4 py-3 border-b border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('food')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-lg transition-all ${
              activeTab === 'food'
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Food
          </button>
          <button
            onClick={() => setActiveTab('beverage')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-lg transition-all ${
              activeTab === 'beverage'
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Beverages
          </button>
        </div>
      </div>

      {/* Menu Items Grid */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-primary-800">
          {activeTab === 'food' ? 'Food' : 'Beverages'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onAdd={handleAddToCart}
              onImageClick={(img) => setSelectedImage(img)}
            />
          ))}
        </div>
      </section>

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
