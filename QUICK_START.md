# Quick Start Guide

Get your AI Meal Planner running in 5 minutes!

## Step 1: Install Dependencies

```bash
cd meal-planner-demo
npm install
```

## Step 2: Set Up OpenAI API Key

1. Get your OpenAI API key from [platform.openai.com](https://platform.openai.com/api-keys)
2. Create a `.env` file in the project root:

```env
OPENAI_API_KEY=sk-your-key-here
```

## Step 3: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 4: Test It Out

### Generate a Meal Plan
1. Click "Meal Plan Generator"
2. Fill in your details:
   - Name: "Test User"
   - Email: "test@example.com"
   - Diet Type: "Balanced"
   - Goal: "Maintenance"
   - Meals Per Day: 3
3. Click "Generate My Meal Plan"
4. Wait 10-20 seconds for AI generation
5. Click "Export PDF" to download

### Generate a Recipe Book
1. Click "Recipe Book Creator"
2. Enter: "5 healthy breakfast recipes"
3. Click "Generate Recipe Book"
4. Browse recipes and export as PDF

## Important Notes

⚠️ **API Costs**: Each generation uses OpenAI API credits:
- Meal Plan: ~$0.50 (GPT-4 + 21 DALL-E 3 images)
- Recipe Book: ~$0.30 (GPT-4 + 5 DALL-E 3 images)

⚠️ **Image Generation**: Images generate asynchronously and may take 30-60 seconds per image. You'll see a loading spinner while they generate.

⚠️ **First Run**: The first generation may take longer as the AI warms up.

## Customization

### Change Brand Colors

Edit `lib/branding.ts`:
```typescript
export const branding = {
  companyName: "Your Company Name",
  colors: {
    primary: "#YOUR_COLOR",
    // ...
  },
};
```

### Adjust AI Behavior

Edit the system prompts in:
- `app/api/generate-meal-plan/route.ts`
- `app/api/generate-recipe-book/route.ts`

## Troubleshooting

### "Failed to generate meal plan"
- Check your OpenAI API key is valid
- Ensure you have API credits available
- Check the browser console for errors

### Images not appearing
- DALL-E 3 generation takes time (30-60s per image)
- Check OpenAI API status
- Verify you have DALL-E 3 access on your API key

### PDF export not working
- Check browser console for errors
- Ensure jsPDF is installed: `npm install jspdf jspdf-autotable`

## Next Steps

- Customize the branding in `lib/branding.ts`
- Adjust the color scheme in `tailwind.config.ts`
- Add your logo to `public/logo.png`
- Deploy to Vercel for production use

## Support

Check the full README.md for detailed documentation.

