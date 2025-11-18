'use client';

interface MealPreview {
  dayName: string;
  mealName: string;
  recipeName: string;
  calories: number;
}

interface Props {
  meals: MealPreview[];
  totalMeals: number;
}

export default function StreamingMealPreview({ meals, totalMeals }: Props) {
  if (meals.length === 0) return null;

  return (
    <div className="fixed bottom-8 right-8 bg-white rounded-xl shadow-2xl border-2 border-brand-primary max-w-md w-full animate-fade-in z-40">
      <div className="p-4 gradient-brand text-white rounded-t-xl">
        <h3 className="font-bold text-lg">Generating Your Meals...</h3>
        <p className="text-sm opacity-90">{meals.length} of {totalMeals} completed</p>
      </div>
      
      <div className="p-4 max-h-80 overflow-y-auto space-y-3">
        {meals.map((meal, idx) => (
          <div 
            key={idx} 
            className="bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5 p-3 rounded-lg border-l-4 border-brand-primary animate-fade-in"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs text-gray-500 font-medium">{meal.dayName} • {meal.mealName}</div>
                <div className="font-semibold text-brand-dark mt-1">{meal.recipeName}</div>
              </div>
              <div className="text-right ml-2">
                <div className="text-lg font-bold text-brand-primary">{Math.round(meal.calories)}</div>
                <div className="text-xs text-gray-500">cal</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 bg-gray-50 rounded-b-xl border-t border-gray-200">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <svg className="w-4 h-4 text-brand-primary animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>More meals generating...</span>
        </div>
      </div>
    </div>
  );
}

