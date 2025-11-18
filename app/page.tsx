'use client';

import { useState } from 'react';
import MealPlanForm from '@/components/MealPlanForm';
import RecipeBookForm from '@/components/RecipeBookForm';
import MealPlanDisplay from '@/components/MealPlanDisplay';
import RecipeBookDisplay from '@/components/RecipeBookDisplay';
import LoadingSpinner from '@/components/LoadingSpinner';
import StreamingMealPreview from '@/components/StreamingMealPreview';
import { MealPlan, RecipeBook } from '@/lib/types';
import { branding } from '@/lib/branding';

type ViewMode = 'home' | 'meal-plan' | 'recipe-book';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [generatedMealPlan, setGeneratedMealPlan] = useState<MealPlan | null>(null);
  const [generatedRecipeBook, setGeneratedRecipeBook] = useState<RecipeBook | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingType, setGeneratingType] = useState<'meal-plan' | 'recipe-book' | null>(null);
  const [streamProgress, setStreamProgress] = useState(0);
  const [streamProgressText, setStreamProgressText] = useState('');
  const [streamingMeals, setStreamingMeals] = useState<any[]>([]);

  const handleMealPlanGenerated = (mealPlan: MealPlan, isComplete: boolean = false) => {
    console.log('[Home] Meal plan updated:', isComplete ? 'complete' : 'partial', 'Days:', mealPlan.days.length);
    console.log('[Home] Current view mode:', viewMode, 'isGenerating:', isGenerating);
    setGeneratedMealPlan(mealPlan);
    
    // Only hide spinner when complete
    if (isComplete) {
      console.log('[Home] Generation complete, hiding spinner');
      setIsGenerating(false);
      setGeneratingType(null);
      setStreamProgress(0);
      setStreamProgressText('');
      setStreamingMeals([]);
    }
  };

  const handleRecipeBookGenerated = (recipeBook: RecipeBook, isComplete: boolean = false) => {
    console.log('[Home] Recipe book updated:', isComplete ? 'complete' : 'partial');
    setGeneratedRecipeBook(recipeBook);
    
    // Only hide spinner when complete
    if (isComplete) {
      setIsGenerating(false);
      setGeneratingType(null);
      setStreamProgress(0);
      setStreamProgressText('');
    }
  };

  const resetToHome = () => {
    setViewMode('home');
    setGeneratedMealPlan(null);
    setGeneratedRecipeBook(null);
    setIsGenerating(false);
    setGeneratingType(null);
  };

  const startGenerating = (type: 'meal-plan' | 'recipe-book') => {
    console.log('[Home] Starting generation:', type, 'Current viewMode:', viewMode);
    setIsGenerating(true);
    setGeneratingType(type);
    setStreamProgress(0);
    setStreamProgressText('');
    setStreamingMeals([]);
  };

  const updateStreamProgress = (progress: number, total: number = 100) => {
    setStreamProgress(progress);
    setStreamProgressText(`${Math.round(progress)}% complete`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-light">
      {/* Header */}
      <header className="gradient-brand text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 cursor-pointer" onClick={resetToHome}>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl">🍽️</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold">{branding.companyName}</h1>
                <p className="text-sm opacity-90">{branding.tagline}</p>
              </div>
            </div>
            {viewMode !== 'home' && (
              <button
                onClick={resetToHome}
                className="bg-white text-brand-primary px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
              >
                Back to Home
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {viewMode === 'home' && !generatedMealPlan && !generatedRecipeBook && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-brand-dark mb-4">
                What would you like to create today?
              </h2>
              <p className="text-lg text-gray-600">
                Generate personalized meal plans or custom recipe books with AI
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Meal Plan Card */}
              <div
                className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-brand-primary"
                onClick={() => setViewMode('meal-plan')}
              >
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-2xl font-bold text-brand-dark mb-3">
                  Meal Plan Generator
                </h3>
                <p className="text-gray-600 mb-4">
                  Create a personalized 7-day meal plan based on your dietary preferences,
                  goals, and restrictions. Export as a beautiful PDF.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-sm font-semibold">
                    Custom Nutrition
                  </span>
                  <span className="bg-brand-secondary/10 text-brand-secondary px-3 py-1 rounded-full text-sm font-semibold">
                    7-Day Plans
                  </span>
                  <span className="bg-brand-accent/10 text-brand-accent px-3 py-1 rounded-full text-sm font-semibold">
                    PDF Export
                  </span>
                </div>
                <button className="w-full gradient-brand text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all">
                  Get Started →
                </button>
              </div>

              {/* Recipe Book Card */}
              <div
                className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-brand-secondary"
                onClick={() => setViewMode('recipe-book')}
              >
                <div className="text-6xl mb-4">📖</div>
                <h3 className="text-2xl font-bold text-brand-dark mb-3">
                  Recipe Book Creator
                </h3>
                <p className="text-gray-600 mb-4">
                  Generate custom recipe collections with AI. Request specific themes like
                  "5 healthy takeaway recipes" and get beautiful, branded PDFs.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-sm font-semibold">
                    AI-Powered
                  </span>
                  <span className="bg-brand-secondary/10 text-brand-secondary px-3 py-1 rounded-full text-sm font-semibold">
                    Custom Themes
                  </span>
                  <span className="bg-brand-accent/10 text-brand-accent px-3 py-1 rounded-full text-sm font-semibold">
                    Beautiful PDFs
                  </span>
                </div>
                <button className="w-full gradient-brand text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all">
                  Create Now →
                </button>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'meal-plan' && !generatedMealPlan && (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <MealPlanForm
              onGenerate={(mealPlan, isComplete) => {
                handleMealPlanGenerated(mealPlan, isComplete);
              }}
              isGenerating={isGenerating}
              onBack={resetToHome}
              onProgress={updateStreamProgress}
              onStartGenerating={() => startGenerating('meal-plan')}
            />
          </div>
        )}

        {viewMode === 'recipe-book' && !generatedRecipeBook && (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <RecipeBookForm
              onGenerate={handleRecipeBookGenerated}
              isGenerating={isGenerating}
              onBack={resetToHome}
              onProgress={updateStreamProgress}
              onStartGenerating={() => startGenerating('recipe-book')}
            />
          </div>
        )}

        {/* Loading with progress bar */}
        {isGenerating && !generatedMealPlan && !generatedRecipeBook && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 animate-fade-in">
              <div className="flex flex-col items-center">
                {/* Animated Icon */}
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 gradient-brand rounded-full animate-pulse opacity-20"></div>
                  <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-brand-primary animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                </div>

                {/* Message */}
                <h3 className="text-2xl font-bold text-brand-dark mb-2 text-center">
                  {generatingType === 'meal-plan' ? 'Creating Your Meal Plan' : 'Generating Your Recipe Book'}
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  Our AI is crafting personalized recipes just for you...
                </p>

                {/* Progress Bar */}
                <div className="w-full">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Processing...</span>
                    <span>{Math.round(streamProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full gradient-brand transition-all duration-500 ease-out rounded-full"
                      style={{ width: `${streamProgress}%` }}
                    />
                  </div>
                </div>

                <p className="text-sm text-gray-500 mt-6 text-center">
                  Please don't close this window
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Show meal plan when complete */}
        {generatedMealPlan && (
          <div className="animate-fade-in">
            <MealPlanDisplay 
              mealPlan={generatedMealPlan} 
              onReset={resetToHome}
              isStreaming={false}
            />
          </div>
        )}

        {generatedRecipeBook && (
          <div className="animate-fade-in">
            <RecipeBookDisplay 
              recipeBook={generatedRecipeBook}
              onReset={resetToHome}
              isStreaming={false}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-brand-dark text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm opacity-80">
            © 2024 {branding.companyName}. All rights reserved.
          </p>
          <p className="text-xs opacity-60 mt-2">
            Powered by AI • Images by DALL-E 3
          </p>
        </div>
      </footer>
    </div>
  );
}

