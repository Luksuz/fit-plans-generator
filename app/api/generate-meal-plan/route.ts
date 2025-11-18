import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { MealPlanForm, MealPlan, DayPlan } from '@/lib/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  console.log('[API] Meal plan generation started');
  
  try {
    const formData: MealPlanForm = await request.json();
    console.log('[API] Form data received:', { 
      name: formData.name, 
      goal: formData.goal, 
      dietType: formData.dietType 
    });

    // Calculate target nutrition based on goal and user preferences
    const targetNutrition = calculateTargetNutrition(formData);

    // Generate meal plan using GPT-4
    const systemPrompt = `You are a professional nutritionist and meal planner. Create a detailed, personalized 7-day meal plan based on the user's preferences and goals.

IMPORTANT: You must respond with ONLY valid JSON, no markdown, no code blocks, no additional text. The JSON must follow this exact structure:

{
  "days": [
    {
      "day": 1,
      "dayName": "Monday",
      "meals": [
        {
          "id": "unique-id",
          "name": "Breakfast/Lunch/Dinner/Snack",
          "time": "8:00 AM",
          "recipe": {
            "id": "recipe-id",
            "name": "Recipe Name",
            "description": "Brief description",
            "prepTime": 15,
            "cookTime": 20,
            "servings": 1,
            "difficulty": "easy",
            "ingredients": [
              {
                "item": "ingredient name",
                "amount": "1",
                "unit": "cup"
              }
            ],
            "instructions": [
              "Step 1",
              "Step 2"
            ],
            "nutrition": {
              "calories": 450,
              "protein": 25,
              "carbs": 50,
              "fat": 15,
              "fiber": 8
            }
          }
        }
      ]
    }
  ]
}`;

    const userPrompt = `Create a 7-day meal plan for:
- Name: ${formData.name}
- Goal: ${formData.goal}
- Diet Type: ${formData.dietType}
- Meals Per Day: ${formData.mealsPerDay}
- Cooking Time: ${formData.cookingTime}
${formData.allergies.length > 0 ? `- Allergies: ${formData.allergies.join(', ')}` : ''}
${formData.dislikes.length > 0 ? `- Dislikes: ${formData.dislikes.join(', ')}` : ''}
${formData.cuisinePreferences.length > 0 ? `- Cuisine Preferences: ${formData.cuisinePreferences.join(', ')}` : ''}
${formData.notes ? `- Additional Notes: ${formData.notes}` : ''}

Target Daily Nutrition:
- Calories: ${Math.round(targetNutrition.calories)}
- Protein: ${Math.round(targetNutrition.protein)}g
- Carbs: ${Math.round(targetNutrition.carbs)}g
- Fat: ${Math.round(targetNutrition.fat)}g

Create ${formData.mealsPerDay} meals per day (typical meal names like Breakfast, Lunch, Dinner, Snack, etc.).
Make recipes practical, delicious, and aligned with the ${formData.cookingTime} cooking time preference.
Ensure each day's meals add up to approximately the target nutrition.

Remember: Response must be ONLY the JSON object, no markdown formatting.`;

    console.log('[API] Calling OpenAI GPT-4...');
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    });

    console.log('[API] Received completion');
    const responseText = completion.choices[0]?.message?.content || '';
    console.log('[API] Response length:', responseText.length);
    
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    let generatedData;
    try {
      generatedData = JSON.parse(responseText);
      console.log('[API] Successfully parsed JSON response');
    } catch (parseError) {
      console.error('[API] JSON parse error:', parseError);
      console.error('[API] Response text sample:', responseText.substring(0, 500) + '...');
      throw new Error('Failed to parse AI response. The response may be incomplete.');
    }

    // Calculate total nutrition for each day
    const days: DayPlan[] = generatedData.days.map((day: any) => {
      const totalNutrition = day.meals.reduce(
        (acc: any, meal: any) => ({
          calories: acc.calories + meal.recipe.nutrition.calories,
          protein: acc.protein + meal.recipe.nutrition.protein,
          carbs: acc.carbs + meal.recipe.nutrition.carbs,
          fat: acc.fat + meal.recipe.nutrition.fat,
          fiber: acc.fiber + (meal.recipe.nutrition.fiber || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
      );

      return {
        ...day,
        totalNutrition,
      };
    });

    const mealPlan: MealPlan = {
      id: `mp-${Date.now()}`,
      userInfo: {
        name: formData.name,
        email: formData.email,
      },
      preferences: formData,
      days,
      createdAt: new Date().toISOString(),
      targetNutrition,
    };

    console.log('[API] Meal plan generated successfully:', mealPlan.id);
    console.log('[API] Total meals:', mealPlan.days.reduce((acc, day) => acc + day.meals.length, 0));

    return NextResponse.json(mealPlan);
  } catch (error) {
    console.error('[API] Error generating meal plan:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate meal plan' },
      { status: 500 }
    );
  }
}

function calculateTargetNutrition(formData: MealPlanForm) {
  // Basic calculation - in a real app, this would be more sophisticated
  let baseCalories = formData.calorieTarget || 2000;

  // Adjust based on goal
  if (formData.goal === 'weight_loss') {
    baseCalories *= 0.85;
  } else if (formData.goal === 'muscle_gain') {
    baseCalories *= 1.15;
  }

  // Calculate macros based on diet type
  let proteinRatio = 0.3;
  let carbsRatio = 0.4;
  let fatRatio = 0.3;

  if (formData.dietType === 'keto') {
    proteinRatio = 0.25;
    carbsRatio = 0.05;
    fatRatio = 0.7;
  } else if (formData.dietType === 'vegan' || formData.dietType === 'vegetarian') {
    proteinRatio = 0.25;
    carbsRatio = 0.5;
    fatRatio = 0.25;
  }

  return {
    calories: baseCalories,
    protein: (baseCalories * proteinRatio) / 4, // 4 cal per gram
    carbs: (baseCalories * carbsRatio) / 4,
    fat: (baseCalories * fatRatio) / 9, // 9 cal per gram
    fiber: 30, // Standard recommendation
  };
}

