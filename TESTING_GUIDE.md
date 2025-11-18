# Testing Guide

## Quick Test Checklist

### Prerequisites
```bash
cd meal-planner-demo
npm install
echo "OPENAI_API_KEY=your-key-here" > .env
npm run dev
```

Open http://localhost:3000 and open DevTools Console (F12)

---

## Test 1: Meal Plan Generation with Logging

### Steps:
1. Click "Meal Plan Generator"
2. Fill in form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Diet Type: "Balanced"
   - Goal: "Maintenance"
   - Meals Per Day: 3
3. Click "Generate My Meal Plan"

### Expected Behavior:
✅ Loading spinner appears immediately  
✅ Console logs show:
```
[Form] Submitting meal plan request
[API] Meal plan generation started
[API] Form data received: { name: "Test User", goal: "maintenance", dietType: "balanced" }
[API] Calling OpenAI GPT-4...
[API] Received response from OpenAI, length: XXXXX
[API] Successfully parsed JSON response
[API] Meal plan generated successfully: mp-XXXXXXXXXX
[API] Total meals: 21
[Form] Meal plan received: mp-XXXXXXXXXX
```
✅ Spinner disappears after 30-60 seconds  
✅ Meal plan displays with all 7 days  
✅ Console logs show localStorage save:
```
[MealPlanDisplay] Saving meal plan to localStorage
[Storage] Saved meal plan: mp-XXXXXXXXXX
```

---

## Test 2: Async Image Generation

### Steps:
1. Continue from Test 1 (meal plan is displayed)
2. Watch the console
3. Watch the meal card images

### Expected Behavior:
✅ Console logs show:
```
[MealPlanDisplay] Starting image generation for all recipes
[MealPlanDisplay] Generating image for: [Recipe Name]
[Image API] Image generation request received
[Image API] Generating image for: [Recipe Name]
```

✅ Each meal card initially shows spinner  
✅ One by one, images appear as generated  
✅ Console logs for each completed image:
```
[Image API] Image generated successfully for: [Recipe Name]
[MealPlanDisplay] Image generated successfully: [Recipe Name]
[Storage] Updated recipe image: recipe-XXXXX
```

✅ All 21 images generate over 10-20 minutes  
✅ Can scroll and interact while images generate  

---

## Test 3: localStorage Persistence

### Steps:
1. Continue from Test 2 (some/all images generated)
2. Note the meal plan ID in console
3. Press F5 to refresh the page
4. Open DevTools → Application → localStorage
5. Look for `fitfuel_meal_plans` key

### Expected Behavior:
✅ localStorage contains saved meal plan  
✅ All generated image URLs are preserved  
✅ Data structure is valid JSON  
✅ Up to 10 meal plans stored (oldest removed)  

### Verify localStorage:
```javascript
// In console
JSON.parse(localStorage.getItem('fitfuel_meal_plans'))
```

Should return array of meal plans with all data.

---

## Test 4: Recipe Book Generation

### Steps:
1. Click "Back to Home"
2. Click "Recipe Book Creator"
3. Enter: "5 healthy breakfast recipes"
4. Click "Generate Recipe Book"

### Expected Behavior:
✅ Loading spinner appears  
✅ Console logs show:
```
[RecipeBookForm] Submitting recipe book request
[API] Recipe book generation started
[API] Form data received: { prompt: "5 healthy breakfast recipes", numberOfRecipes: 5 }
[API] Calling OpenAI GPT-4...
[API] Received response from OpenAI, length: XXXXX
[API] Successfully parsed JSON response
[API] Recipe book generated successfully: rb-XXXXXXXXXX
[API] Total recipes: 5
```

✅ Recipe book displays with 5 recipes  
✅ Images generate asynchronously  
✅ Saved to localStorage:
```
[RecipeBookDisplay] Saving recipe book to localStorage
[Storage] Saved recipe book: rb-XXXXXXXXXX
```

---

## Test 5: Error Handling

### Test 5a: Invalid API Key

1. Stop server
2. Edit `.env` - set wrong API key
3. Restart server: `npm run dev`
4. Try to generate meal plan

Expected:
✅ Loading spinner appears  
✅ Console shows error  
✅ User sees alert: "Failed to generate meal plan..."  
✅ Spinner disappears  

### Test 5b: Network Error

1. Disconnect internet
2. Try to generate

Expected:
✅ Network error logged  
✅ User-friendly error message  

---

## Test 6: PDF Export

### Steps:
1. Generate a meal plan (or recipe book)
2. Wait for completion
3. Click "Export PDF"

### Expected Behavior:
✅ Button shows "Exporting..." with spinner  
✅ PDF downloads after 1-2 seconds  
✅ PDF contains:
  - Branded cover page
  - All recipes with ingredients
  - All instructions
  - Nutrition information
  - Company colors throughout

✅ Filename: `FitFuel-MealPlan-[Name].pdf`

---

## Test 7: Multiple Generations

### Steps:
1. Generate 3 different meal plans
2. Generate 3 different recipe books
3. Check localStorage

### Expected Behavior:
✅ All 6 items saved  
✅ localStorage logs each save  
✅ Most recent items appear first  
✅ Old items removed if > 10 total  

---

## Test 8: Image Display States

### Steps:
1. Generate meal plan
2. Observe each meal card

### Expected States:
1. **Initial**: Gray placeholder with 🍽️ emoji
2. **Generating**: Spinner with "Generating image..."
3. **Complete**: Beautiful DALL-E 3 image
4. **Error** (if generation fails): Fallback to placeholder

---

## Test 9: Responsive Design

### Steps:
1. Resize browser window
2. Test on mobile viewport (Chrome DevTools)
3. Try different screen sizes

### Expected Behavior:
✅ Layout adapts smoothly  
✅ Forms remain usable  
✅ Images scale properly  
✅ Navigation works  
✅ Spinner centers correctly  

---

## Test 10: Form Validation

### Steps:
1. Try to submit meal plan form without name
2. Try to submit recipe book form without prompt
3. Add invalid email

### Expected Behavior:
✅ Browser validation prevents submission  
✅ Required fields highlighted  
✅ Email format validated  

---

## Performance Tests

### Meal Plan Generation:
- **Expected time**: 30-60 seconds
- **API calls**: 1 (GPT-4)
- **Cost**: ~$0.10

### Image Generation (per image):
- **Expected time**: 30-60 seconds
- **API calls**: 1 (DALL-E 3)
- **Cost**: ~$0.02

### Full Meal Plan (with images):
- **Total time**: 15-20 minutes (21 images)
- **Total cost**: ~$0.52

### Recipe Book (5 recipes):
- **Total time**: 3-5 minutes
- **Total cost**: ~$0.15

---

## Common Issues & Solutions

### Issue: "No response from OpenAI"
**Solution**: Check API key in `.env`

### Issue: "JSON parse error"
**Solution**: Check console for sample response. May need to adjust max_tokens.

### Issue: Images not generating
**Solution**: 
- Check OpenAI API status
- Verify DALL-E 3 access on API key
- Check console for specific errors

### Issue: localStorage quota exceeded
**Solution**: Clear old data:
```javascript
localStorage.removeItem('fitfuel_meal_plans')
localStorage.removeItem('fitfuel_recipe_books')
```

### Issue: Slow generation
**Solution**: Normal for GPT-4. Takes 30-60 seconds.

---

## Debug Commands

### View localStorage:
```javascript
// All meal plans
console.log(JSON.parse(localStorage.getItem('fitfuel_meal_plans')))

// All recipe books
console.log(JSON.parse(localStorage.getItem('fitfuel_recipe_books')))
```

### Clear localStorage:
```javascript
localStorage.clear()
```

### Check for pending images:
```javascript
const plans = JSON.parse(localStorage.getItem('fitfuel_meal_plans'))
plans[0].days.forEach(day => {
  day.meals.forEach(meal => {
    console.log(meal.recipe.name, ':', 
      meal.recipe.imageUrl ? 'Has image' : 'No image',
      meal.recipe.imageGenerating ? '(Generating)' : ''
    )
  })
})
```

---

## Success Criteria

✅ All console logs appear at expected times  
✅ Spinner shows during generation  
✅ Meal plans and recipe books generate successfully  
✅ Images generate and display asynchronously  
✅ Data persists in localStorage  
✅ Page refresh preserves data  
✅ PDFs export correctly  
✅ Errors handled gracefully  
✅ No console errors (except intentional tests)  
✅ User experience is smooth and professional  

---

## Final Verification

Run through all 10 tests in order. At the end:

✅ At least 1 complete meal plan saved  
✅ At least 1 complete recipe book saved  
✅ localStorage contains valid data  
✅ All features working as documented  
✅ Console logs provide clear debugging info  
✅ No blocking errors  

If all tests pass: **Application is ready for demo! 🎉**

