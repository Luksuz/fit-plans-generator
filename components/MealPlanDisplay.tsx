'use client';

import { useState, useEffect } from 'react';
import { MealPlan } from '@/lib/types';
import { exportMealPlanToPDF } from '@/lib/pdf-export';
import { saveMealPlan, updateRecipeImage } from '@/lib/storage';

interface Props {
  mealPlan: MealPlan;
  onReset: () => void;
  isStreaming?: boolean;
}

export default function MealPlanDisplay({ mealPlan: initialMealPlan, onReset, isStreaming }: Props) {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [mealPlan, setMealPlan] = useState(initialMealPlan);

  // Save to localStorage on mount
  useEffect(() => {
    console.log('[MealPlanDisplay] Saving meal plan to localStorage');
    saveMealPlan(mealPlan);
  }, [mealPlan]);

  // Generate images for all recipes
  useEffect(() => {
    const generateImages = async () => {
      console.log('[MealPlanDisplay] Starting image generation for all recipes');
      
      for (const day of mealPlan.days) {
        for (const meal of day.meals) {
          if (!meal.recipe.imageUrl && !meal.recipe.imageGenerating) {
            // Mark as generating
            meal.recipe.imageGenerating = true;
            setMealPlan({ ...mealPlan });
            
            try {
              console.log('[MealPlanDisplay] Generating image for:', meal.recipe.name);
              
              const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  recipeName: meal.recipe.name,
                  ingredients: meal.recipe.ingredients,
                }),
              });

              if (response.ok) {
                const { imageUrl } = await response.json();
                
                console.log('[MealPlanDisplay] Image generated successfully:', meal.recipe.name);
                
                // Update the meal plan with the new image
                setMealPlan(prevPlan => {
                  const updatedPlan = { ...prevPlan };
                  for (const d of updatedPlan.days) {
                    for (const m of d.meals) {
                      if (m.recipe.id === meal.recipe.id) {
                        m.recipe.imageUrl = imageUrl;
                        m.recipe.imageGenerating = false;
                      }
                    }
                  }
                  return updatedPlan;
                });
                
                // Update localStorage
                updateRecipeImage(mealPlan.id, meal.recipe.id, imageUrl);
              } else {
                console.error('[MealPlanDisplay] Failed to generate image for:', meal.recipe.name);
                meal.recipe.imageGenerating = false;
              }
            } catch (error) {
              console.error('[MealPlanDisplay] Error generating image:', error);
              meal.recipe.imageGenerating = false;
            }
          }
        }
      }
    };

    generateImages();
  }, [initialMealPlan.id]); // Only run once on mount

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportMealPlanToPDF(mealPlan);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const day = mealPlan.days[selectedDay];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-brand-dark mb-2">
              Your Personalized Meal Plan
            </h2>
            <p className="text-gray-600">
              Created for {mealPlan.userInfo.name} • {new Date(mealPlan.createdAt).toLocaleDateString()}
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

        {/* Nutrition Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-brand-primary to-brand-secondary text-white p-4 rounded-lg">
            <div className="text-sm opacity-90">Daily Calories</div>
            <div className="text-2xl font-bold">{Math.round(mealPlan.targetNutrition.calories)}</div>
          </div>
          <div className="bg-gradient-to-br from-brand-secondary to-brand-accent text-white p-4 rounded-lg">
            <div className="text-sm opacity-90">Protein</div>
            <div className="text-2xl font-bold">{Math.round(mealPlan.targetNutrition.protein)}g</div>
          </div>
          <div className="bg-gradient-to-br from-brand-accent to-brand-primary text-white p-4 rounded-lg">
            <div className="text-sm opacity-90">Carbs</div>
            <div className="text-2xl font-bold">{Math.round(mealPlan.targetNutrition.carbs)}g</div>
          </div>
          <div className="bg-gradient-to-br from-brand-primary to-brand-accent text-white p-4 rounded-lg">
            <div className="text-sm opacity-90">Fat</div>
            <div className="text-2xl font-bold">{Math.round(mealPlan.targetNutrition.fat)}g</div>
          </div>
        </div>
      </div>

      {/* Day Selector */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <div className="flex gap-2 overflow-x-auto">
          {mealPlan.days.map((d, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDay(idx)}
              className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                selectedDay === idx
                  ? 'gradient-brand text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {d.dayName}
            </button>
          ))}
        </div>
      </div>

      {/* Meals */}
      <div className="space-y-6">
        {day.meals.filter(meal => meal.recipe?.name).map((meal) => (
          <div key={meal.id} className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-brand-dark">{meal.recipe.name}</h3>
                  <p className="text-gray-600">{meal.time} • {meal.name}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-brand-primary">
                    {Math.round(meal.recipe.nutrition.calories)} cal
                  </div>
                  <div className="text-sm text-gray-600">
                    P: {Math.round(meal.recipe.nutrition.protein)}g • C: {Math.round(meal.recipe.nutrition.carbs)}g • F: {Math.round(meal.recipe.nutrition.fat)}g
                  </div>
                </div>
              </div>

              {/* Image */}
              <div className="mb-4">
                {isStreaming && !meal.recipe.imageUrl ? (
                  <div className="w-full h-64 bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-2">✨</div>
                      <p className="text-gray-500 font-medium">Recipe generated!</p>
                      <p className="text-sm text-gray-400">Image coming soon...</p>
                    </div>
                  </div>
                ) : meal.recipe.imageGenerating ? (
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <svg className="animate-spin h-10 w-10 text-brand-primary mx-auto mb-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <p className="text-gray-500">Generating image...</p>
                    </div>
                  </div>
                ) : meal.recipe.imageUrl ? (
                  <img
                    src={meal.recipe.imageUrl}
                    alt={meal.recipe.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-lg flex items-center justify-center">
                    <span className="text-6xl">🍽️</span>
                  </div>
                )}
              </div>

              {/* Recipe Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-brand-dark mb-2">Ingredients</h4>
                  <ul className="space-y-1">
                    {meal.recipe.ingredients.map((ing, idx) => (
                      <li key={idx} className="text-gray-700">
                        • {ing.amount} {ing.unit} {ing.item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-brand-dark mb-2">Instructions</h4>
                  <ol className="space-y-2">
                    {meal.recipe.instructions.map((step, idx) => (
                      <li key={idx} className="text-gray-700">
                        <span className="font-semibold text-brand-primary">{idx + 1}.</span> {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Meta Info */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex gap-4 text-sm text-gray-600">
                <span>⏱️ Prep: {meal.recipe.prepTime} min</span>
                <span>🍳 Cook: {meal.recipe.cookTime} min</span>
                <span>🍽️ Servings: {meal.recipe.servings}</span>
                <span className={`px-2 py-1 rounded ${
                  meal.recipe.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                  meal.recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {meal.recipe.difficulty}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Day Summary */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
        <h3 className="text-xl font-bold text-brand-dark mb-4">Daily Total</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-600">Calories</div>
            <div className="text-xl font-bold text-brand-primary">
              {Math.round(day.totalNutrition.calories)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Protein</div>
            <div className="text-xl font-bold text-brand-secondary">
              {Math.round(day.totalNutrition.protein)}g
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Carbs</div>
            <div className="text-xl font-bold text-brand-accent">
              {Math.round(day.totalNutrition.carbs)}g
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Fat</div>
            <div className="text-xl font-bold text-brand-primary">
              {Math.round(day.totalNutrition.fat)}g
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

