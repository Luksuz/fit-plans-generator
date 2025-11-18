import OpenAI from 'openai';
import { Recipe, MealPlan, RecipeBook } from './types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In-memory storage for generated images (in a real app, use a database)
const imageCache = new Map<string, string>();

export async function generateRecipeImage(recipe: Recipe): Promise<string> {
  // Check cache first
  if (imageCache.has(recipe.id)) {
    return imageCache.get(recipe.id)!;
  }

  try {
    // Create a detailed prompt based on the recipe
    const ingredientsList = recipe.ingredients
      .slice(0, 5)
      .map(ing => ing.item)
      .join(', ');

    const prompt = `Professional food photography of ${recipe.name}. 
A beautifully plated dish featuring ${ingredientsList}. 
The dish should look appetizing, fresh, and restaurant-quality. 
Natural lighting, shallow depth of field, styled for a cookbook.
High-resolution, vibrant colors, professional composition.`;

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'natural',
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error('No image URL returned');
    }

    // Cache the result
    imageCache.set(recipe.id, imageUrl);

    return imageUrl;
  } catch (error) {
    console.error(`Error generating image for recipe ${recipe.id}:`, error);
    throw error;
  }
}

export async function generateRecipeImages(
  data: MealPlan | { recipes: Recipe[] }
): Promise<void> {
  // Extract all recipes
  let recipes: Recipe[];
  
  if ('days' in data) {
    // It's a MealPlan
    recipes = data.days.flatMap(day => day.meals.map(meal => meal.recipe));
  } else {
    // It's a RecipeBook or similar
    recipes = data.recipes;
  }

  // Mark all recipes as generating
  recipes.forEach(recipe => {
    recipe.imageGenerating = true;
  });

  // Generate images asynchronously (don't await)
  recipes.forEach(async (recipe) => {
    try {
      const imageUrl = await generateRecipeImage(recipe);
      recipe.imageUrl = imageUrl;
      recipe.imageGenerating = false;
      
      // In a real app, you would:
      // 1. Store this in a database
      // 2. Notify the frontend via WebSocket or polling
      console.log(`Image generated for recipe: ${recipe.name}`);
    } catch (error) {
      console.error(`Failed to generate image for recipe: ${recipe.name}`, error);
      recipe.imageGenerating = false;
    }
  });
}

export async function getRecipeImage(recipeId: string): Promise<string | null> {
  return imageCache.get(recipeId) || null;
}

