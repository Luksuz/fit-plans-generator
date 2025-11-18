# FitFuel - AI Meal Planner & Recipe Book Generator

A modern Next.js application that creates personalized meal plans and recipe books using AI, complete with DALL-E 3 generated images and professional PDF exports.

## Features

### 🍽️ Meal Plan Generator
- **Personalized 7-Day Plans**: Custom meal plans based on dietary preferences, goals, and restrictions
- **Smart Nutrition Tracking**: Automatic calorie and macro calculations aligned with user goals
- **Dietary Flexibility**: Support for keto, vegan, vegetarian, paleo, mediterranean, and balanced diets
- **Allergen Management**: Handles allergies and food dislikes
- **Beautiful PDFs**: Export meal plans as professionally branded PDF documents

### 📖 Recipe Book Creator
- **AI-Powered Generation**: Create custom recipe collections from natural language prompts
- **Flexible Themes**: Generate any type of recipe collection (e.g., "5 healthy takeaway recipes")
- **Detailed Recipes**: Complete with ingredients, instructions, nutrition info, and cooking times
- **Professional PDFs**: Export recipe books with beautiful formatting and branding

### 🎨 Visual Features
- **DALL-E 3 Integration**: Automatically generates beautiful food images for every recipe
- **Async Image Generation**: Images load progressively without blocking the user experience
- **Branded Design**: Customizable company colors, logos, and styling throughout
- **Responsive UI**: Modern, mobile-friendly interface with smooth animations

### 📄 PDF Export
- **Professional Layouts**: Clean, well-organized PDF documents
- **Branded Elements**: Company colors, logos, and styling in every PDF
- **Complete Information**: All recipes, nutrition info, and instructions included
- **Easy Download**: One-click PDF generation and download

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4 Turbo + DALL-E 3
- **PDF Generation**: jsPDF + jspdf-autotable
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ installed
- OpenAI API key with access to GPT-4 and DALL-E 3

### Installation

1. **Clone the repository**
   ```bash
   cd meal-planner-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Required: OpenAI API Key for GPT-4 and DALLE-3
   OPENAI_API_KEY=your_openai_api_key_here

   # Optional: Company Branding
   NEXT_PUBLIC_COMPANY_NAME="FitFuel"
   NEXT_PUBLIC_COMPANY_LOGO_URL="/logo.png"
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Creating a Meal Plan

1. Click on "Meal Plan Generator" from the home page
2. Fill out the form with:
   - Personal information (name, email)
   - Dietary preferences (diet type, allergies, dislikes)
   - Goals (weight loss, muscle gain, maintenance, energy)
   - Meal preferences (meals per day, cooking time, cuisines)
3. Click "Generate My Meal Plan"
4. Wait for the AI to create your personalized 7-day plan
5. View each day's meals with images and full recipes
6. Export as PDF for offline access

### Creating a Recipe Book

1. Click on "Recipe Book Creator" from the home page
2. Enter your request (e.g., "5 healthy takeaway recipes")
3. Optionally select a diet type and number of recipes
4. Click "Generate Recipe Book"
5. Browse through the generated recipes
6. Export as a beautifully formatted PDF

## Customization

### Branding

Edit `/lib/branding.ts` to customize:
- Company name
- Brand colors
- Logo URL
- Tagline

```typescript
export const branding = {
  companyName: "Your Company",
  colors: {
    primary: "#FF6B35",
    secondary: "#F7931E",
    accent: "#FDC830",
    // ... more colors
  },
  logo: "/your-logo.png",
  tagline: "Your Custom Tagline",
};
```

### Styling

The app uses Tailwind CSS with custom brand colors. Modify `tailwind.config.ts` to adjust the theme.

## API Endpoints

### POST `/api/generate-meal-plan`

Generates a personalized 7-day meal plan.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "dietType": "balanced",
  "goal": "weight_loss",
  "mealsPerDay": 3,
  "allergies": ["peanuts"],
  "dislikes": ["mushrooms"],
  "cuisinePreferences": ["Italian", "Asian"],
  "cookingTime": "moderate",
  "calorieTarget": 2000
}
```

### POST `/api/generate-recipe-book`

Generates a custom recipe book.

**Request Body:**
```json
{
  "prompt": "5 healthy takeaway recipes",
  "dietType": "balanced",
  "numberOfRecipes": 5
}
```

## Image Generation

Images are generated asynchronously using DALL-E 3:
- Each recipe gets a unique, high-quality food photograph
- Images appear progressively as they're generated
- Fallback placeholder shown while generating
- Results are cached for performance

## PDF Export

PDFs include:
- Branded cover page
- Table of contents (for recipe books)
- Complete recipes with ingredients and instructions
- Nutrition information
- Professional formatting with company colors

## Performance Considerations

- **Image Generation**: Runs asynchronously to avoid blocking
- **Caching**: Generated images are cached in memory
- **Streaming**: API responses stream data as it's available
- **Optimization**: Images are optimized for web delivery

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app is a standard Next.js application and can be deployed to any platform that supports Node.js:
- Netlify
- AWS Amplify
- Railway
- Your own server

## Future Enhancements

Possible improvements for production use:

- **Database Integration**: Store meal plans and recipe books
- **User Authentication**: User accounts and saved plans
- **Email Delivery**: Automatic email delivery of PDFs
- **Real-time Updates**: WebSocket integration for live image updates
- **Shopping Lists**: Generate grocery lists from meal plans
- **Meal Prep Instructions**: Batch cooking and prep guides
- **Recipe Scaling**: Adjust serving sizes dynamically
- **Social Sharing**: Share recipes and meal plans
- **Print Optimization**: Better print layouts for recipes

## Demo Requirements Met

✅ **User Input Form**: Comprehensive form for meal plan preferences  
✅ **AI Recipe Generation**: GPT-4 powered recipe creation  
✅ **DALL-E 3 Images**: Beautiful food photography for every recipe  
✅ **Async Image Generation**: Progressive loading without blocking  
✅ **PDF Export**: Professional, branded PDF documents  
✅ **Downloadable**: One-click download functionality  
✅ **Branded Design**: Custom colors, logos, and styling throughout  

## License

MIT License - feel free to use this project for your demo or production needs.

## Support

For questions or issues, please create an issue in the repository.

---

Built with ❤️ using Next.js, OpenAI, and modern web technologies.

