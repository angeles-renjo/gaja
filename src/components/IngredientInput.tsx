interface IngredientInputProps {
  index: number;
  ingredientName: string;
  weight: string;
  onIngredientChange: (index: number, field: 'ingredient_name' | 'weight', value: string) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

export default function IngredientInput({
  index,
  ingredientName,
  weight,
  onIngredientChange,
  onRemove,
  canRemove,
}: IngredientInputProps) {
  return (
    <div className="flex gap-3 items-start">
      {/* Ingredient Name Input */}
      <div className="flex-1">
        <input
          type="text"
          placeholder="Ingredient name (e.g., All-purpose flour)"
          value={ingredientName}
          onChange={(e) => onIngredientChange(index, 'ingredient_name', e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-800"
          required
        />
      </div>

      {/* Weight Input */}
      <div className="w-50">
        <input
          type="text"
          placeholder="Amount (e.g., 2 cups)"
          value={weight}
          onChange={(e) => onIngredientChange(index, 'weight', e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-700"
          required
        />
      </div>

      {/* Remove Button */}
      {canRemove && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          aria-label="Remove ingredient"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      {/* Placeholder to maintain alignment when remove button is hidden */}
      {!canRemove && <div className="w-10" />}
    </div>
  );
}
