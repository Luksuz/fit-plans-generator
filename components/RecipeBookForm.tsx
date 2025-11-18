'use client';

import { useState } from 'react';
import { RecipeBookForm as RecipeBookFormType, RecipeBook } from '@/lib/types';
import { dietTypeLabels } from '@/lib/branding';

interface Props {
  onGenerate: (recipeBook: RecipeBook, isComplete?: boolean) => void;
  isGenerating: boolean;
  onBack: () => void;
  onProgress?: (progress: number, total: number) => void;
  onStartGenerating?: () => void;
}

export default function RecipeBookForm({ onGenerate, isGenerating, onBack, onProgress, onStartGenerating }: Props) {
  const [formData, setFormData] = useState<RecipeBookFormType>({
    prompt: '5 healthy takeaway recipes',
    dietType: 'balanced',
    numberOfRecipes: 5,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isGenerating) return;
    
    console.log('[RecipeBookForm] Submitting recipe book request');
    
    if (onStartGenerating) {
      onStartGenerating();
    }
    
    try {
      // Start fake progress animation
      const startTime = Date.now();
      const duration = 180000; // 3 minutes
      
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 95); // Cap at 95% until done
        
        if (onProgress) {
          onProgress(Math.floor(progress), 100);
        }
      }, 500);

      const response = await fetch('/api/generate-recipe-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate recipe book');
      }

      const recipeBook: RecipeBook = await response.json();
      console.log('[RecipeBookForm] Recipe book received:', recipeBook.id);
      
      // Set to 100% and show result
      if (onProgress) {
        onProgress(100, 100);
      }
      
      setTimeout(() => {
        onGenerate(recipeBook, true);
      }, 300);
    } catch (error) {
      console.error('[RecipeBookForm] Error generating recipe book:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate recipe book. Please try again.');
    }
  };

  const examplePrompts = [
    "5 healthy takeaway recipes",
    "10 quick breakfast ideas under 15 minutes",
    "7 high-protein vegetarian dinners",
    "5 meal prep recipes for the week",
    "8 delicious smoothie bowl recipes",
    "6 comfort food makeovers",
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-brand-primary hover:text-brand-secondary font-semibold"
        >
          ← Back
        </button>
      </div>

      <h2 className="text-3xl font-bold text-brand-dark mb-6">Create Your Recipe Book</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            What recipes would you like? *
          </label>
          <textarea
            required
            value={formData.prompt}
            onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            rows={4}
            placeholder="e.g., 5 healthy takeaway recipes"
          />
          <p className="text-sm text-gray-500 mt-1">
            Be specific! Include the number of recipes and the theme you want.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Need inspiration? Try these:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {examplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setFormData({ ...formData, prompt })}
                className="text-left px-4 py-2 bg-gray-50 hover:bg-brand-primary/10 hover:text-brand-primary rounded-lg text-sm transition-colors border border-gray-200"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Recipes
            </label>
            <input
              type="number"
              value={formData.numberOfRecipes}
              onChange={(e) => setFormData({ ...formData, numberOfRecipes: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              min="1"
              max="20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diet Type (optional)
            </label>
            <select
              value={formData.dietType}
              onChange={(e) => setFormData({ ...formData, dietType: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            >
              {Object.entries(dietTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="text-2xl">✨</div>
            <div>
              <h4 className="font-semibold text-brand-dark mb-1">AI-Powered Generation</h4>
              <p className="text-sm text-gray-600">
                Your recipe book will be generated with beautiful images using DALL-E 3. 
                Images are generated asynchronously, so you'll see them appear as they're created.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isGenerating}
          className="w-full gradient-brand text-white py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating Your Recipe Book...
            </span>
          ) : (
            'Generate Recipe Book'
          )}
        </button>
      </form>
    </div>
  );
}

