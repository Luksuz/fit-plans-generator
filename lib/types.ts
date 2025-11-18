export interface MealPlanForm {
  // Personal Info
  name: string;
  email: string;
  
  // Dietary Preferences
  dietType: 'balanced' | 'keto' | 'vegan' | 'vegetarian' | 'paleo' | 'mediterranean';
  allergies: string[];
  dislikes: string[];
  
  // Goals
  goal: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'energy';
  calorieTarget?: number;
  
  // Preferences
  mealsPerDay: number;
  cuisinePreferences: string[];
  cookingTime: 'quick' | 'moderate' | 'elaborate';
  
  // Additional Info
  notes?: string;
}

export interface RecipeBookForm {
  prompt: string; // e.g., "5 healthy takeaway recipes"
  dietType?: 'balanced' | 'keto' | 'vegan' | 'vegetarian' | 'paleo' | 'mediterranean';
  numberOfRecipes?: number;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: Ingredient[];
  instructions: string[];
  nutrition: NutritionInfo;
  imageUrl?: string;
  imageGenerating?: boolean;
}

export interface Ingredient {
  item: string;
  amount: string;
  unit?: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export interface MealPlan {
  id: string;
  userInfo: {
    name: string;
    email: string;
  };
  preferences: MealPlanForm;
  days: DayPlan[];
  createdAt: string;
  targetNutrition: NutritionInfo;
}

export interface DayPlan {
  day: number;
  dayName: string;
  meals: Meal[];
  totalNutrition: NutritionInfo;
}

export interface Meal {
  id: string;
  name: string;
  time: string;
  recipe: Recipe;
}

export interface RecipeBook {
  id: string;
  title: string;
  description: string;
  recipes: Recipe[];
  createdAt: string;
}

export interface ImageGenerationJob {
  recipeId: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  imageUrl?: string;
  error?: string;
}

