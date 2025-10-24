import Link from 'next/link';
import { Recipe } from '@/types';

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  // Format date
  const createdDate = new Date(recipe.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Truncate instructions for preview
  const previewText = recipe.instructions?.length > 120
    ? recipe.instructions.substring(0, 120) + '...'
    : recipe.instructions;

  return (
    <Link href={`/recipes/${recipe.id}`}>
      <div className="group h-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary-400 cursor-pointer">
        {/* Recipe Icon */}
        <div className="mb-4 inline-flex rounded-lg bg-primary-100 p-3 text-primary-600 transition-colors group-hover:bg-primary-500 group-hover:text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
            />
          </svg>
        </div>

        {/* Recipe Name */}
        <h3 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
          {recipe.name}
        </h3>

        {/* Instructions Preview */}
        {previewText && (
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4">
            {previewText}
          </p>
        )}

        {/* Created Date */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500">{createdDate}</span>

          {/* Arrow indicator */}
          <div className="opacity-0 transform -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-5 h-5 text-primary-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
