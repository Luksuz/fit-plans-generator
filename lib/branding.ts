export const branding = {
  companyName: process.env.NEXT_PUBLIC_COMPANY_NAME || "FitFuel",
  colors: {
    primary: "#FF6B35",
    secondary: "#F7931E",
    accent: "#FDC830",
    dark: "#2E3440",
    light: "#ECEFF4",
    white: "#FFFFFF",
    text: "#2E3440",
  },
  logo: (process.env.NEXT_PUBLIC_COMPANY_LOGO_URL || null) as string | null, // Set to your logo path
  tagline: "Personalized Nutrition, Powered by AI",
};

export const dietTypeLabels: Record<string, string> = {
  balanced: "Balanced",
  keto: "Keto",
  vegan: "Vegan",
  vegetarian: "Vegetarian",
  paleo: "Paleo",
  mediterranean: "Mediterranean",
};

export const goalLabels: Record<string, string> = {
  weight_loss: "Weight Loss",
  muscle_gain: "Muscle Gain",
  maintenance: "Maintenance",
  energy: "Energy & Wellness",
};

export const cookingTimeLabels: Record<string, string> = {
  quick: "Quick (15-30 min)",
  moderate: "Moderate (30-60 min)",
  elaborate: "Elaborate (60+ min)",
};

