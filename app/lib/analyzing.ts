/**
 * Helper functions for the analyzing screen.
 */

export type RecommendationColor = "green" | "amber" | "red";

/**
 * Maps a recommendation headline to a border color.
 */
export function getRecommendationColor(headline: string): RecommendationColor {
  const lower = headline.toLowerCase();
  const greenPhrases = ["purchase", "buy", "good buy", "worth buying", "recommend"];
  const redPhrases = ["pass", "skip", "avoid", "skip it", "steer clear"];
  if (greenPhrases.some((p) => lower.includes(p))) {
    return "green";
  }
  if (redPhrases.some((p) => lower.includes(p))) {
    return "red";
  }
  // "Worth a closer look" or uncertain cases
  return "amber";
}

/**
 * Get Tailwind color values for recommendation colors.
 */
export function getColorValue(color: RecommendationColor): {
  rgb: string;
  tailwind: string;
} {
  switch (color) {
    case "green":
      return { rgb: "16, 185, 129", tailwind: "emerald-500" };
    case "amber":
      return { rgb: "245, 158, 11", tailwind: "amber-500" };
    case "red":
      return { rgb: "239, 68, 68", tailwind: "red-500" };
  }
}

/**
 * Get yellow color for initial analysis phase - deeper, more saturated amber.
 */
export function getYellowColor(): { rgb: string; tailwind: string } {
  // Deeper amber: more saturated yellow-orange (closer to amber-500 but warmer)
  return { rgb: "245, 158, 11", tailwind: "amber-500" };
}
