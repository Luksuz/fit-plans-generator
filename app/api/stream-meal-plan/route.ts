import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { MealPlanForm } from '@/lib/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  console.log('[Stream API] Meal plan generation started');
  
  try {
    const formData: MealPlanForm = await request.json();
    console.log('[Stream API] Form data received');

    const targetNutrition = calculateTargetNutrition(formData);

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

Target Daily Nutrition:
- Calories: ${Math.round(targetNutrition.calories)}
- Protein: ${Math.round(targetNutrition.protein)}g
- Carbs: ${Math.round(targetNutrition.carbs)}g
- Fat: ${Math.round(targetNutrition.fat)}g

Create ${formData.mealsPerDay} meals per day.
Remember: Response must be ONLY the JSON object, no markdown formatting.`;

    console.log('[Stream API] Starting OpenAI stream...');
    
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 16000,
      stream: true,
    });

    // Create a readable stream for the client
    const encoder = new TextEncoder();
    let accumulatedText = '';
    let lastSentMealCount = 0;
    let lastValidPartialData: any = null;
    
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          console.log('[Stream API] Starting to process OpenAI stream chunks...');
          
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            accumulatedText += content;
            
            // Only try parsing after receiving closing braces (potential meal completion)
            if (!content.includes('}')) {
              continue;
            }
            
            // Count complete nutrition blocks
            const nutritionMatches = accumulatedText.match(/"nutrition"\s*:\s*\{[^}]*"calories"\s*:\s*\d+[^}]*"protein"\s*:\s*\d+[^}]*"carbs"\s*:\s*\d+[^}]*"fat"\s*:\s*\d+[^}]*\}/g);
            
            if (!nutritionMatches || nutritionMatches.length <= lastSentMealCount) {
              continue; // No new complete meals
            }
            
            console.log('[Stream API] 🎯 Found', nutritionMatches.length, 'complete nutrition blocks, trying to parse...');
            
            // Find the last complete closing brace position for a meal
            // Look backwards from the end to find a good cutoff point
            let lastGoodPosition = accumulatedText.length;
            let depth = 0;
            let inString = false;
            let escapeNext = false;
            
            // Go backwards to find where the last complete nutrition block ends
            for (let i = accumulatedText.length - 1; i >= 0; i--) {
              const char = accumulatedText[i];
              
              if (escapeNext) {
                escapeNext = false;
                continue;
              }
              
              if (char === '\\' && i > 0) {
                escapeNext = true;
                continue;
              }
              
              if (char === '"' && !escapeNext) {
                inString = !inString;
              }
              
              if (!inString) {
                if (char === '}') depth++;
                else if (char === '{') depth--;
                
                // Found a point where we're back at depth 0 after a closing brace
                if (depth === 0 && char === '}') {
                  lastGoodPosition = i + 1;
                  break;
                }
              }
            }
            
            // Extract only the clean part up to last complete structure
            let cleanJson = accumulatedText.substring(0, lastGoodPosition);
            
            // Now safely close the JSON
            let openBraces = 0;
            let openBrackets = 0;
            inString = false;
            escapeNext = false;
            
            for (let i = 0; i < cleanJson.length; i++) {
              const char = cleanJson[i];
              
              if (escapeNext) {
                escapeNext = false;
                continue;
              }
              
              if (char === '\\') {
                escapeNext = true;
                continue;
              }
              
              if (char === '"') {
                inString = !inString;
                continue;
              }
              
              if (!inString) {
                if (char === '{') openBraces++;
                else if (char === '}') openBraces--;
                else if (char === '[') openBrackets++;
                else if (char === ']') openBrackets--;
              }
            }
            
            // Close remaining structures
            for (let i = 0; i < openBrackets; i++) cleanJson += ']';
            for (let i = 0; i < openBraces; i++) cleanJson += '}';
            
            try {
              const partialData = JSON.parse(cleanJson);
              console.log('[Stream API] ✅ Successfully parsed!');
              
              if (partialData.days && Array.isArray(partialData.days)) {
                const days = partialData.days.map((day: any) => {
                  const validMeals = (day.meals || []).filter((meal: any) => 
                    meal.recipe?.nutrition?.calories && 
                    meal.recipe?.name
                  );
                  
                  const totalNutrition = {
                    calories: 0,
                    protein: 0,
                    carbs: 0,
                    fat: 0,
                    fiber: 0,
                  };
                  
                  validMeals.forEach((meal: any) => {
                    totalNutrition.calories += meal.recipe.nutrition.calories || 0;
                    totalNutrition.protein += meal.recipe.nutrition.protein || 0;
                    totalNutrition.carbs += meal.recipe.nutrition.carbs || 0;
                    totalNutrition.fat += meal.recipe.nutrition.fat || 0;
                    totalNutrition.fiber += meal.recipe.nutrition.fiber || 0;
                  });
                  
                  return {
                    day: day.day,
                    dayName: day.dayName,
                    meals: validMeals,
                    totalNutrition,
                  };
                }).filter((day: any) => day.meals.length > 0);
                
                const totalMealCount = days.reduce((sum: number, day: any) => sum + day.meals.length, 0);
                
                if (totalMealCount > lastSentMealCount) {
                  console.log('[Stream API] 🚀 SENDING', totalMealCount, 'meals via SSE!');
                  
                  const partialMealPlan = {
                    id: `mp-${Date.now()}`,
                    userInfo: { name: formData.name, email: formData.email },
                    preferences: formData,
                    days,
                    createdAt: new Date().toISOString(),
                    targetNutrition,
                  };
                  
                  lastValidPartialData = partialMealPlan;
                  
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'partial',
                    mealsComplete: totalMealCount,
                    data: partialMealPlan,
                  })}\n\n`));
                  
                  lastSentMealCount = totalMealCount;
                }
              }
            } catch (parseErr) {
              // Still can't parse, will try again on next closing brace
            }
          }
          
          // Send complete data
          console.log('[Stream API] Stream complete, parsing final JSON...');
          
          try {
            const finalData = JSON.parse(accumulatedText);
            
            // Calculate totals
            const days = finalData.days.map((day: any) => {
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
              return { ...day, totalNutrition };
            });

            const mealPlan = {
              id: `mp-${Date.now()}`,
              userInfo: { name: formData.name, email: formData.email },
              preferences: formData,
              days,
              createdAt: new Date().toISOString(),
              targetNutrition,
            };
            
            const completeUpdate = {
              type: 'complete',
              data: mealPlan,
            };
            
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(completeUpdate)}\n\n`));
            console.log('[Stream API] Sent complete meal plan');
          } catch (parseError) {
            console.error('[Stream API] Parse error:', parseError);
            console.error('[Stream API] Response length:', accumulatedText.length);
            
            // If we have valid partial data, send that as complete
            if (lastValidPartialData) {
              console.log('[Stream API] Using last valid partial data as complete');
              const completeUpdate = {
                type: 'complete',
                data: lastValidPartialData,
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(completeUpdate)}\n\n`));
            } else {
              const errorUpdate = {
                type: 'error',
                error: 'Response was truncated. Try requesting fewer meals per day.',
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorUpdate)}\n\n`));
            }
          }
          
          controller.close();
        } catch (error) {
          console.error('[Stream API] Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('[Stream API] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate meal plan' }),
      { status: 500 }
    );
  }
}

function calculateTargetNutrition(formData: MealPlanForm) {
  let baseCalories = formData.calorieTarget || 2000;

  if (formData.goal === 'weight_loss') {
    baseCalories *= 0.85;
  } else if (formData.goal === 'muscle_gain') {
    baseCalories *= 1.15;
  }

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
    protein: (baseCalories * proteinRatio) / 4,
    carbs: (baseCalories * carbsRatio) / 4,
    fat: (baseCalories * fatRatio) / 9,
    fiber: 30,
  };
}

