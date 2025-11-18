'use client';

import { useState, useEffect } from 'react';
import { RecipeBook } from '@/lib/types';
import { exportRecipeBookToPDF } from '@/lib/pdf-export';
import { saveRecipeBook, updateRecipeImage } from '@/lib/storage';

interface Props {
  recipeBook: RecipeBook;
  onReset: () => void;
  isStreaming?: boolean;
}

export default function RecipeBookDisplay({ recipeBook: initialRecipeBook, onReset, isStreaming }: Props) {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(0);
  const [recipeBook, setRecipeBook] = useState(initialRecipeBook);

  // Save to localStorage
  useEffect(() => {
    console.log('[RecipeBookDisplay] Saving recipe book to localStorage');
    saveRecipeBook(recipeBook);
  }, [recipeBook]);

  // Generate images for all recipes
  useEffect(() => {
    const generateImages = async () => {
      console.log('[RecipeBookDisplay] Starting image generation for all recipes');
      
      for (const recipe of recipeBook.recipes) {
        if (!recipe.imageUrl && !recipe.imageGenerating) {
          // Mark as generating
          recipe.imageGenerating = true;
          setRecipeBook({ ...recipeBook });
          
          try {
            console.log('[RecipeBookDisplay] Generating image for:', recipe.name);
            
            const response = await fetch('/api/generate-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                recipeName: recipe.name,
                ingredients: recipe.ingredients,
              }),
            });

            if (response.ok) {
              const { imageUrl } = await response.json();
              
              console.log('[RecipeBookDisplay] Image generated successfully:', recipe.name);
              
              // Update the recipe book with the new image
              setRecipeBook(prevBook => {
                const updatedBook = { ...prevBook };
                const recipeToUpdate = updatedBook.recipes.find(r => r.id === recipe.id);
                if (recipeToUpdate) {
                  recipeToUpdate.imageUrl = imageUrl;
                  recipeToUpdate.imageGenerating = false;
                }
                return updatedBook;
              });
              
              // Update localStorage
              updateRecipeImage(recipeBook.id, recipe.id, imageUrl);
            } else {
              console.error('[RecipeBookDisplay] Failed to generate image for:', recipe.name);
              recipe.imageGenerating = false;
            }
          } catch (error) {
            console.error('[RecipeBookDisplay] Error generating image:', error);
            recipe.imageGenerating = false;
          }
        }
      }
    };

    generateImages();
  }, [initialRecipeBook.id]); // Only run once on mount

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportRecipeBookToPDF(recipeBook);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const recipe = recipeBook.recipes[selectedRecipe];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-brand-dark mb-2">
              {recipeBook.title}
            </h2>
            <p className="text-gray-600">
              {recipeBook.description} • {new Date(recipeBook.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="gradient-brand text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  📄 Export PDF
                </>
              )}
            </button>
            <button
              onClick={onReset}
              className="border-2 border-brand-primary text-brand-primary px-6 py-3 rounded-lg font-semibold hover:bg-brand-primary hover:text-white transition-all"
            >
              Create New
            </button>
          </div>
        </div>

        {/* Recipe Summary */}
        <div className="text-center">
          <div className="text-5xl mb-4">📖</div>
          <p className="text-lg text-gray-600">
            {recipeBook.recipes.length} delicious recipes to explore
          </p>
        </div>
      </div>

      {/* Recipe Selector */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-brand-dark mb-4">Select a Recipe</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {recipeBook.recipes.map((r, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedRecipe(idx)}
              className={`p-4 rounded-lg text-left transition-all ${
                selectedRecipe === idx
                  ? 'gradient-brand text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="font-semibold text-sm mb-1">{r.name}</div>
              <div className="text-xs opacity-80">{Math.round(r.nutrition.calories)} cal</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recipe Display */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Image */}
        <div className="relative">
          {isStreaming && !recipe.imageUrl ? (
            <div className="w-full h-96 bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center">
              <div className="text-center">
                <div className="text-9xl mb-4">✨</div>
                <p className="text-2xl text-gray-700 font-bold">Recipe Generated!</p>
                <p className="text-gray-500 mt-2">Image coming soon...</p>
              </div>
            </div>
          ) : recipe.imageGenerating ? (
            <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <svg className="animate-spin h-12 w-12 text-brand-primary mx-auto mb-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-gray-500 text-lg">Generating beautiful image...</p>
              </div>
            </div>
          ) : recipe.imageUrl ? (
            <img
              src={recipe.imageUrl}
              alt={recipe.name}
              className="w-full h-96 object-cover"
            />
          ) : (
            <div className="w-full h-96 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 flex items-center justify-center">
              <span className="text-9xl">🍽️</span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-8">
            <h3 className="text-4xl font-bold text-white mb-2">{recipe.name}</h3>
            <p className="text-white/90 text-lg">{recipe.description}</p>
          </div>
        </div>

        {/* Recipe Details */}
        <div className="p-8">
          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⏱️</span>
              <div>
                <div className="text-sm text-gray-600">Prep Time</div>
                <div className="font-semibold">{recipe.prepTime} min</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍳</span>
              <div>
                <div className="text-sm text-gray-600">Cook Time</div>
                <div className="font-semibold">{recipe.cookTime} min</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍽️</span>
              <div>
                <div className="text-sm text-gray-600">Servings</div>
                <div className="font-semibold">{recipe.servings}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <div>
                <div className="text-sm text-gray-600">Difficulty</div>
                <div className={`font-semibold ${
                  recipe.difficulty === 'easy' ? 'text-green-600' :
                  recipe.difficulty === 'medium' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
                </div>
              </div>
            </div>
          </div>

          {/* Nutrition */}
          <div className="mb-6">
            <h4 className="text-xl font-bold text-brand-dark mb-3">Nutrition (per serving)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-brand-primary/10 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Calories</div>
                <div className="text-2xl font-bold text-brand-primary">
                  {Math.round(recipe.nutrition.calories)}
                </div>
              </div>
              <div className="bg-brand-secondary/10 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Protein</div>
                <div className="text-2xl font-bold text-brand-secondary">
                  {Math.round(recipe.nutrition.protein)}g
                </div>
              </div>
              <div className="bg-brand-accent/10 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Carbs</div>
                <div className="text-2xl font-bold text-brand-accent">
                  {Math.round(recipe.nutrition.carbs)}g
                </div>
              </div>
              <div className="bg-brand-primary/10 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Fat</div>
                <div className="text-2xl font-bold text-brand-primary">
                  {Math.round(recipe.nutrition.fat)}g
                </div>
              </div>
            </div>
          </div>

          {/* Ingredients and Instructions */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-bold text-brand-dark mb-4">Ingredients</h4>
              <ul className="space-y-2">
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-brand-primary mt-1">•</span>
                    <span className="text-gray-700">
                      <span className="font-semibold">{ing.amount}</span>
                      {ing.unit && <span> {ing.unit}</span>}
                      <span> {ing.item}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold text-brand-dark mb-4">Instructions</h4>
              <ol className="space-y-3">
                {recipe.instructions.map((step, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full gradient-brand text-white flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-gray-700 pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

