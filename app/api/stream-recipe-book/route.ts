import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { RecipeBookForm } from '@/lib/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  console.log('[Stream API] Recipe book generation started');
  
  try {
    const formData: RecipeBookForm = await request.json();
    console.log('[Stream API] Form data received');

    const systemPrompt = `You are a professional chef and recipe creator. Create detailed, delicious recipes based on the user's request.

IMPORTANT: You must respond with ONLY valid JSON, no markdown, no code blocks, no additional text. The JSON must follow this exact structure:

{
  "title": "Recipe Book Title",
  "description": "Brief description of the recipe collection",
  "recipes": [
    {
      "id": "recipe-id",
      "name": "Recipe Name",
      "description": "Detailed description of the dish",
      "prepTime": 15,
      "cookTime": 25,
      "servings": 4,
      "difficulty": "easy",
      "ingredients": [
        {
          "item": "ingredient name",
          "amount": "2",
          "unit": "cups"
        }
      ],
      "instructions": [
        "Detailed step 1",
        "Detailed step 2"
      ],
      "nutrition": {
        "calories": 450,
        "protein": 25,
        "carbs": 50,
        "fat": 15,
        "fiber": 8
      }
    }
  ]
}`;

    const userPrompt = `Create a recipe book based on this request: "${formData.prompt}"

${formData.dietType ? `Diet Type: ${formData.dietType}` : ''}
Number of Recipes: ${formData.numberOfRecipes || 5}

Make the recipes:
- Detailed and easy to follow
- Creative and delicious
- Properly portioned with accurate nutrition information
- Varied in ingredients and cooking methods

Generate exactly ${formData.numberOfRecipes || 5} unique recipes.

Remember: Response must be ONLY the JSON object, no markdown formatting.`;

    console.log('[Stream API] Starting OpenAI stream...');
    
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.9,
      max_tokens: 16000,
      stream: true,
    });

    const encoder = new TextEncoder();
    let accumulatedText = '';
    let lastSentRecipeCount = 0;
    
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          console.log('[Stream API] Starting to process OpenAI stream chunks...');
          
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              console.log('[Stream API] Received chunk:', content.substring(0, 50) + '...');
            }
            accumulatedText += content;
            
            // Try to parse partial JSON and send complete recipes
            try {
              let testJson = accumulatedText;
              
              // Count open brackets/braces
              const openBrackets = (testJson.match(/\[/g) || []).length - (testJson.match(/\]/g) || []).length;
              const openBraces = (testJson.match(/\{/g) || []).length - (testJson.match(/\}/g) || []).length;
              
              // Try to close the JSON
              testJson += ']'.repeat(Math.max(0, openBrackets));
              testJson += '}'.repeat(Math.max(0, openBraces));
              
              const partialData = JSON.parse(testJson);
              
              if (partialData.recipes) {
                // Count completed recipes
                let completeRecipeCount = 0;
                const completeRecipes = [];
                
                for (const recipe of partialData.recipes) {
                  if (recipe.nutrition?.calories && recipe.instructions?.length > 0) {
                    completeRecipeCount++;
                    completeRecipes.push(recipe);
                  }
                }
                
                if (completeRecipeCount > lastSentRecipeCount) {
                  // Build partial recipe book
                  const partialRecipeBook = {
                    id: `rb-${Date.now()}`,
                    title: partialData.title || 'Recipe Book',
                    description: partialData.description || 'Loading...',
                    recipes: completeRecipes,
                    createdAt: new Date().toISOString(),
                  };
                  
                  const update = {
                    type: 'partial',
                    recipesComplete: completeRecipeCount,
                    data: partialRecipeBook,
                  };
                  
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(update)}\n\n`));
                  lastSentRecipeCount = completeRecipeCount;
                  console.log('[Stream API] Sent partial recipe book: recipes =', completeRecipeCount);
                }
              }
            } catch (e) {
              // Partial JSON parsing failed, continue accumulating
            }
          }
          
          // Send complete data
          console.log('[Stream API] Stream complete, parsing final JSON...');
          
          try {
            const finalData = JSON.parse(accumulatedText);
            
            const recipeBook = {
              id: `rb-${Date.now()}`,
              title: finalData.title,
              description: finalData.description,
              recipes: finalData.recipes,
              createdAt: new Date().toISOString(),
            };
            
            const completeUpdate = {
              type: 'complete',
              data: recipeBook,
            };
            
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(completeUpdate)}\n\n`));
            console.log('[Stream API] Sent complete recipe book');
          } catch (parseError) {
            console.error('[Stream API] Parse error:', parseError);
            const errorUpdate = {
              type: 'error',
              error: 'Failed to parse response',
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorUpdate)}\n\n`));
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
      JSON.stringify({ error: 'Failed to generate recipe book' }),
      { status: 500 }
    );
  }
}

