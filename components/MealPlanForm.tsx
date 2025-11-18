'use client';

import { useState } from 'react';
import { MealPlanForm as MealPlanFormType, MealPlan } from '@/lib/types';
import { dietTypeLabels, goalLabels, cookingTimeLabels } from '@/lib/branding';

interface Props {
  onGenerate: (mealPlan: MealPlan, isComplete?: boolean) => void;
  isGenerating: boolean;
  onBack: () => void;
  onProgress?: (progress: number, total: number) => void;
  onStartGenerating?: () => void;
}

export default function MealPlanForm({ onGenerate, isGenerating, onBack, onProgress, onStartGenerating }: Props) {
  const [formData, setFormData] = useState<MealPlanFormType>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    dietType: 'balanced',
    allergies: [],
    dislikes: [],
    goal: 'maintenance',
    mealsPerDay: 3,
    cuisinePreferences: ['Italian', 'Asian'],
    cookingTime: 'moderate',
    notes: 'Looking for healthy, delicious meals that are easy to prepare.',
  });

  const [allergyInput, setAllergyInput] = useState('');
  const [dislikeInput, setDislikeInput] = useState('');
  const [cuisineInput, setCuisineInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isGenerating) return;

    console.log('[Form] Submitting meal plan request');

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

      const response = await fetch('/api/generate-meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate meal plan');
      }

      const mealPlan: MealPlan = await response.json();
      console.log('[Form] Meal plan received:', mealPlan.id);
      
      // Set to 100% and show result
      if (onProgress) {
        onProgress(100, 100);
      }
      
      setTimeout(() => {
        onGenerate(mealPlan, true);
      }, 300);
    } catch (error) {
      console.error('[Form] Error generating meal plan:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate meal plan. Please try again.');
    }
  };

  const addItem = (value: string, field: 'allergies' | 'dislikes' | 'cuisinePreferences', setter: (val: string) => void) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setter('');
    }
  };

  const removeItem = (index: number, field: 'allergies' | 'dislikes' | 'cuisinePreferences') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

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

      <h2 className="text-3xl font-bold text-brand-dark mb-6">Create Your Meal Plan</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-brand-dark">Personal Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="john@example.com"
            />
          </div>
        </div>

        {/* Dietary Preferences */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-brand-dark">Dietary Preferences</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diet Type *
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allergies & Restrictions
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(allergyInput, 'allergies', setAllergyInput))}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                placeholder="e.g., peanuts, dairy"
              />
              <button
                type="button"
                onClick={() => addItem(allergyInput, 'allergies', setAllergyInput)}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.allergies.map((allergy, idx) => (
                <span key={idx} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {allergy}
                  <button type="button" onClick={() => removeItem(idx, 'allergies')} className="font-bold">×</button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Foods You Dislike
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={dislikeInput}
                onChange={(e) => setDislikeInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(dislikeInput, 'dislikes', setDislikeInput))}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                placeholder="e.g., mushrooms, fish"
              />
              <button
                type="button"
                onClick={() => addItem(dislikeInput, 'dislikes', setDislikeInput)}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.dislikes.map((dislike, idx) => (
                <span key={idx} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {dislike}
                  <button type="button" onClick={() => removeItem(idx, 'dislikes')} className="font-bold">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Goals */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-brand-dark">Your Goals</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Goal *
            </label>
            <select
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            >
              {Object.entries(goalLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Daily Calories (optional)
            </label>
            <input
              type="number"
              value={formData.calorieTarget || ''}
              onChange={(e) => setFormData({ ...formData, calorieTarget: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="e.g., 2000"
              min="1000"
              max="5000"
            />
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-brand-dark">Meal Preferences</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meals Per Day *
            </label>
            <select
              value={formData.mealsPerDay}
              onChange={(e) => setFormData({ ...formData, mealsPerDay: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            >
              <option value={2}>2 meals</option>
              <option value={3}>3 meals</option>
              <option value={4}>4 meals</option>
              <option value={5}>5 meals</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cooking Time Preference *
            </label>
            <select
              value={formData.cookingTime}
              onChange={(e) => setFormData({ ...formData, cookingTime: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            >
              {Object.entries(cookingTimeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cuisine Preferences
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={cuisineInput}
                onChange={(e) => setCuisineInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(cuisineInput, 'cuisinePreferences', setCuisineInput))}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                placeholder="e.g., Italian, Asian, Mexican"
              />
              <button
                type="button"
                onClick={() => addItem(cuisineInput, 'cuisinePreferences', setCuisineInput)}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.cuisinePreferences.map((cuisine, idx) => (
                <span key={idx} className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {cuisine}
                  <button type="button" onClick={() => removeItem(idx, 'cuisinePreferences')} className="font-bold">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            rows={4}
            placeholder="Any other preferences or requirements..."
          />
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
              Generating Your Meal Plan...
            </span>
          ) : (
            'Generate My Meal Plan'
          )}
        </button>
      </form>
    </div>
  );
}

