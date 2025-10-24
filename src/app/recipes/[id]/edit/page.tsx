'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import RecipeForm from '@/components/RecipeForm';
import { useRecipe } from '@/hooks/useRecipe';

export default function EditRecipePage() {
  const params = useParams();
  const recipeId = params.id as string;
  const { recipe, isLoading, error } = useRecipe(recipeId);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recipe...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">{error || 'Recipe not found'}</p>
          <Link
            href="/recipes"
            className="mt-4 inline-block text-primary-600 hover:text-primary-700"
          >
            ← Back to Recipes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href={`/recipes/${recipe.id}`}
            className="text-sm text-primary-600 hover:text-primary-700 mb-2 inline-block"
          >
            ← Back to Recipe
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Recipe</h1>
          <p className="text-gray-600 mt-1">Update &quot;{recipe.name}&quot;</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <RecipeForm mode="edit" initialData={recipe} />
        </div>
      </main>
    </div>
  );
}
