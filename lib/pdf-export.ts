import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MealPlan, RecipeBook, Recipe } from './types';
import { branding, goalLabels, dietTypeLabels } from './branding';

// Helper to convert hex to RGB
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

const primaryRGB = hexToRgb(branding.colors.primary);
const secondaryRGB = hexToRgb(branding.colors.secondary);
const accentRGB = hexToRgb(branding.colors.accent);

export async function exportMealPlanToPDF(mealPlan: MealPlan) {
  const doc = new jsPDF();
  let yPosition = 20;

  // Title Page
  doc.setFillColor(...primaryRGB);
  doc.rect(0, 0, 210, 60, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text(branding.companyName, 105, 30, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('7-Day Personalized Meal Plan', 105, 42, { align: 'center' });

  // User Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  yPosition = 75;
  doc.text(`Prepared for: ${mealPlan.userInfo.name}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Date: ${new Date(mealPlan.createdAt).toLocaleDateString()}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Goal: ${goalLabels[mealPlan.preferences.goal]}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Diet Type: ${dietTypeLabels[mealPlan.preferences.dietType]}`, 20, yPosition);

  // Nutritional Summary Box
  yPosition += 15;
  doc.setFillColor(...accentRGB);
  doc.roundedRect(20, yPosition, 170, 35, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Daily Nutritional Targets', 105, yPosition + 10, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const targets = `Calories: ${Math.round(mealPlan.targetNutrition.calories)} | Protein: ${Math.round(mealPlan.targetNutrition.protein)}g | Carbs: ${Math.round(mealPlan.targetNutrition.carbs)}g | Fat: ${Math.round(mealPlan.targetNutrition.fat)}g`;
  doc.text(targets, 105, yPosition + 24, { align: 'center' });

  // Loop through each day
  for (let i = 0; i < mealPlan.days.length; i++) {
    const day = mealPlan.days[i];

    // New page for each day (except the first which continues from title)
    if (i > 0) {
      doc.addPage();
      yPosition = 20;
    } else {
      yPosition += 50;
    }

    // Day Header
    doc.setFillColor(...primaryRGB);
    doc.rect(0, yPosition - 5, 210, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(day.dayName, 105, yPosition + 5, { align: 'center' });

    yPosition += 20;

    // Day's meals
    for (const meal of day.meals) {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // Meal Header
      doc.setTextColor(...secondaryRGB);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${meal.name} - ${meal.recipe.name}`, 20, yPosition);
      yPosition += 7;

      // Time and Nutrition
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${meal.time} | ${Math.round(meal.recipe.nutrition.calories)} cal, ${Math.round(meal.recipe.nutrition.protein)}g protein, ${Math.round(meal.recipe.nutrition.carbs)}g carbs, ${Math.round(meal.recipe.nutrition.fat)}g fat`, 20, yPosition);
      yPosition += 10;

      // Ingredients
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Ingredients:', 20, yPosition);
      yPosition += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      for (const ing of meal.recipe.ingredients) {
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`• ${ing.amount} ${ing.unit || ''} ${ing.item}`, 25, yPosition);
        yPosition += 5;
      }

      yPosition += 3;

      // Instructions
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Instructions:', 20, yPosition);
      yPosition += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      meal.recipe.instructions.forEach((step, idx) => {
        if (yPosition > 275) {
          doc.addPage();
          yPosition = 20;
        }
        const lines = doc.splitTextToSize(`${idx + 1}. ${step}`, 165);
        doc.text(lines, 25, yPosition);
        yPosition += lines.length * 5 + 2;
      });

      yPosition += 8;

      // Separator line
      doc.setDrawColor(...primaryRGB);
      doc.setLineWidth(0.5);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 10;
    }

    // Daily Total
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFillColor(240, 240, 240);
    doc.roundedRect(20, yPosition, 170, 18, 2, 2, 'F');

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Daily Total: ${Math.round(day.totalNutrition.calories)} cal | ${Math.round(day.totalNutrition.protein)}g protein | ${Math.round(day.totalNutrition.carbs)}g carbs | ${Math.round(day.totalNutrition.fat)}g fat`, 105, yPosition + 12, { align: 'center' });
  }

  // Footer on last page
  doc.addPage();
  doc.setFillColor(...primaryRGB);
  doc.rect(0, 0, 210, 297, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('Enjoy Your Journey!', 105, 120, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(branding.tagline, 105, 135, { align: 'center' });

  doc.setFontSize(12);
  doc.text(`© ${new Date().getFullYear()} ${branding.companyName}`, 105, 270, { align: 'center' });

  // Save the PDF
  doc.save(`${branding.companyName}-MealPlan-${mealPlan.userInfo.name.replace(/\s+/g, '-')}.pdf`);
}

export async function exportRecipeBookToPDF(recipeBook: RecipeBook) {
  const doc = new jsPDF();

  // Title Page
  doc.setFillColor(...primaryRGB);
  doc.rect(0, 0, 210, 80, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text(branding.companyName, 105, 35, { align: 'center' });

  doc.setFontSize(18);
  doc.setFont('helvetica', 'normal');
  doc.text(recipeBook.title, 105, 55, { align: 'center' });

  doc.setFontSize(12);
  doc.text(recipeBook.description, 105, 68, { align: 'center' });

  // Table of Contents
  let yPosition = 100;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Table of Contents', 105, yPosition, { align: 'center' });
  yPosition += 15;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  recipeBook.recipes.forEach((recipe, idx) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    doc.text(`${idx + 1}. ${recipe.name}`, 30, yPosition);
    yPosition += 8;
  });

  // Each recipe gets its own page
  recipeBook.recipes.forEach((recipe, idx) => {
    doc.addPage();
    yPosition = 20;

    // Recipe Header
    doc.setFillColor(...secondaryRGB);
    doc.rect(0, yPosition - 10, 210, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(recipe.name, 105, yPosition + 5, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(recipe.description, 105, yPosition + 15, { align: 'center' });

    yPosition += 35;

    // Recipe Info Box
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(20, yPosition, 170, 25, 2, 2, 'F');

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    const info = `⏱️ Prep: ${recipe.prepTime} min | 🍳 Cook: ${recipe.cookTime} min | 🍽️ Servings: ${recipe.servings} | 📊 ${recipe.difficulty}`;
    doc.text(info, 105, yPosition + 10, { align: 'center' });

    const nutrition = `${Math.round(recipe.nutrition.calories)} cal | ${Math.round(recipe.nutrition.protein)}g protein | ${Math.round(recipe.nutrition.carbs)}g carbs | ${Math.round(recipe.nutrition.fat)}g fat`;
    doc.text(nutrition, 105, yPosition + 18, { align: 'center' });

    yPosition += 35;

    // Ingredients
    doc.setTextColor(...primaryRGB);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Ingredients', 20, yPosition);
    yPosition += 8;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    recipe.ingredients.forEach(ing => {
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`• ${ing.amount} ${ing.unit || ''} ${ing.item}`, 25, yPosition);
      yPosition += 6;
    });

    yPosition += 5;

    // Instructions
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setTextColor(...primaryRGB);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Instructions', 20, yPosition);
    yPosition += 8;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    recipe.instructions.forEach((step, stepIdx) => {
      if (yPosition > 275) {
        doc.addPage();
        yPosition = 20;
      }
      const lines = doc.splitTextToSize(`${stepIdx + 1}. ${step}`, 165);
      doc.text(lines, 25, yPosition);
      yPosition += lines.length * 5 + 4;
    });
  });

  // Back Cover
  doc.addPage();
  doc.setFillColor(...accentRGB);
  doc.rect(0, 0, 210, 297, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('Happy Cooking!', 105, 130, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(branding.tagline, 105, 145, { align: 'center' });

  doc.setFontSize(12);
  doc.text(`© ${new Date().getFullYear()} ${branding.companyName}`, 105, 270, { align: 'center' });

  // Save the PDF
  doc.save(`${branding.companyName}-${recipeBook.title.replace(/\s+/g, '-')}.pdf`);
}

