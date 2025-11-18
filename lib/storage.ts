import { MealPlan, RecipeBook } from './types';

const MEAL_PLANS_KEY = 'fitfuel_meal_plans';
const RECIPE_BOOKS_KEY = 'fitfuel_recipe_books';

// Meal Plans
export function saveMealPlan(mealPlan: MealPlan): void {
  if (typeof window === 'undefined') return;
  
  try {
    const existing = getMealPlans();
    const updated = [mealPlan, ...existing].slice(0, 10); // Keep last 10
    localStorage.setItem(MEAL_PLANS_KEY, JSON.stringify(updated));
    console.log('[Storage] Saved meal plan:', mealPlan.id);
  } catch (error) {
    console.error('[Storage] Error saving meal plan:', error);
  }
}

export function getMealPlans(): MealPlan[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(MEAL_PLANS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('[Storage] Error loading meal plans:', error);
    return [];
  }
}

export function getMealPlanById(id: string): MealPlan | null {
  const plans = getMealPlans();
  return plans.find(plan => plan.id === id) || null;
}

export function deleteMealPlan(id: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const plans = getMealPlans();
    const updated = plans.filter(plan => plan.id !== id);
    localStorage.setItem(MEAL_PLANS_KEY, JSON.stringify(updated));
    console.log('[Storage] Deleted meal plan:', id);
  } catch (error) {
    console.error('[Storage] Error deleting meal plan:', error);
  }
}

// Recipe Books
export function saveRecipeBook(recipeBook: RecipeBook): void {
  if (typeof window === 'undefined') return;
  
  try {
    const existing = getRecipeBooks();
    const updated = [recipeBook, ...existing].slice(0, 10); // Keep last 10
    localStorage.setItem(RECIPE_BOOKS_KEY, JSON.stringify(updated));
    console.log('[Storage] Saved recipe book:', recipeBook.id);
  } catch (error) {
    console.error('[Storage] Error saving recipe book:', error);
  }
}

export function getRecipeBooks(): RecipeBook[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(RECIPE_BOOKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('[Storage] Error loading recipe books:', error);
    return [];
  }
}

export function getRecipeBookById(id: string): RecipeBook | null {
  const books = getRecipeBooks();
  return books.find(book => book.id === id) || null;
}

export function deleteRecipeBook(id: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const books = getRecipeBooks();
    const updated = books.filter(book => book.id !== id);
    localStorage.setItem(RECIPE_BOOKS_KEY, JSON.stringify(updated));
    console.log('[Storage] Deleted recipe book:', id);
  } catch (error) {
    console.error('[Storage] Error deleting recipe book:', error);
  }
}

// Image URL updates
export function updateRecipeImage(planOrBookId: string, recipeId: string, imageUrl: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Check meal plans
    const mealPlans = getMealPlans();
    const planIndex = mealPlans.findIndex(p => p.id === planOrBookId);
    if (planIndex >= 0) {
      const plan = mealPlans[planIndex];
      for (const day of plan.days) {
        for (const meal of day.meals) {
          if (meal.recipe.id === recipeId) {
            meal.recipe.imageUrl = imageUrl;
            meal.recipe.imageGenerating = false;
            localStorage.setItem(MEAL_PLANS_KEY, JSON.stringify(mealPlans));
            console.log('[Storage] Updated recipe image:', recipeId);
            return;
          }
        }
      }
    }
    
    // Check recipe books
    const recipeBooks = getRecipeBooks();
    const bookIndex = recipeBooks.findIndex(b => b.id === planOrBookId);
    if (bookIndex >= 0) {
      const book = recipeBooks[bookIndex];
      const recipe = book.recipes.find(r => r.id === recipeId);
      if (recipe) {
        recipe.imageUrl = imageUrl;
        recipe.imageGenerating = false;
        localStorage.setItem(RECIPE_BOOKS_KEY, JSON.stringify(recipeBooks));
        console.log('[Storage] Updated recipe image:', recipeId);
      }
    }
  } catch (error) {
    console.error('[Storage] Error updating recipe image:', error);
  }
}

