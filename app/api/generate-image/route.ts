import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  console.log('[Image API] Image generation request received');
  
  try {
    const { recipeName, ingredients } = await request.json();
    
    console.log('[Image API] Generating image for:', recipeName);
    
    const ingredientsList = ingredients
      .slice(0, 5)
      .map((ing: any) => ing.item)
      .join(', ');

    const prompt = `Professional food photography of ${recipeName}. 
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
      throw new Error('No image URL returned from DALL-E');
    }

    console.log('[Image API] Image generated successfully for:', recipeName);

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('[Image API] Error generating image:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate image' },
      { status: 500 }
    );
  }
}

