import Link from 'next/link';
import RecipeForm from '@/components/RecipeForm';

export default function NewRecipePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/recipes" className="text-sm text-primary-600 hover:text-primary-700 mb-2 inline-block">
            ← Back to Recipes
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Recipe</h1>
          <p className="text-gray-600 mt-1">Add a new recipe to your collection</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <RecipeForm mode="create" />
        </div>
      </main>
    </div>
  );
}
