
import { GoogleGenAI } from "@google/genai";
import { UserProfile, WashroomFeature, RouteOption } from "../types";

export const getAccessibilityInsights = async (
  profile: UserProfile,
  target: WashroomFeature,
  routes: RouteOption[]
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const fastest = routes.find(r => r.type === 'fastest');
    const accessible = routes.find(r => r.type === 'accessible');

    const prompt = `
      System: You are Wayly, a helper for accessibility mapping. 
      Your job is to translate functional movement needs into route preferences and explain accessibility tradeoffs in plain language.
      
      User Movement Profile: 
      - Uses wheels: ${profile.movement.usesWheels}
      - Avoids stairs: ${profile.movement.avoidStairs}
      - Prefers ramps: ${profile.movement.preferRamps}
      - Max walking distance: ${profile.movement.maxWalkingDistance || 'Unlimited'}m
      - Speed: ${profile.speed}
      
      Destination: "${target.properties.name}".
      Destination Notes: "${target.properties.notes}".
      
      Context:
      - The Fastest route takes ${fastest?.duration} but might have accessibility barriers.
      - The Most Accessible route takes ${accessible?.duration} and is optimized for functional movement needs.
      
      Task: Explain the tradeoff between speed and accessibility for this specific user. 
      Reference the destination's specific notes (like stairs, potholes, or distance) if relevant to their functional needs.
      Be concise (max 2 sentences), friendly, and avoid identity-based labels.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 120
      }
    });

    return response.text || "Wayly is helping you find the most reliable path for your needs.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Wayly recommends the most accessible path to ensure a smooth journey.";
  }
};
