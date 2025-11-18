import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { RecipeBookForm, RecipeBook } from '@/lib/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  console.log('[API] Recipe book generation started');
  
  try {
    const formData: RecipeBookForm = await request.json();
    console.log('[API] Form data received:', { 
      prompt: formData.prompt, 
      numberOfRecipes: formData.numberOfRecipes 
    });

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
- Suitable for the specified diet type

Generate exactly ${formData.numberOfRecipes || 5} unique recipes.

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

    const recipeBook: RecipeBook = {
      id: `rb-${Date.now()}`,
      title: generatedData.title,
      description: generatedData.description,
      recipes: generatedData.recipes,
      createdAt: new Date().toISOString(),
    };

    console.log('[API] Recipe book generated successfully:', recipeBook.id);
    console.log('[API] Total recipes:', recipeBook.recipes.length);

    return NextResponse.json(recipeBook);
  } catch (error) {
    console.error('[API] Error generating recipe book:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate recipe book' },
      { status: 500 }
    );
  }
}

