
import { GoogleGenAI } from "@google/genai";
import { UserProfile, WashroomFeature, RouteOption } from "../types";

export const getAccessibilityInsights = async (
  profile: UserProfile,
  target: WashroomFeature,
  routes: RouteOption[]
): Promise<string> => {
  try {
    /* Initialize GoogleGenAI with the API key from environment variables. 
       Always create a fresh instance before calling to ensure latest config. */
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

    /* Generate content using gemini-3-flash-preview. 
       We rely on the model's default output limits for simple text reasoning tasks. */
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        /* Recommendation: Avoid setting maxOutputTokens if not required to prevent truncated responses. */
      }
    });

    /* Directly accessing the .text property from the response as per Gemini API guidelines. */
    return response.text || "Wayly is helping you find the most reliable path for your needs.";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    
    // Check for rate limit or quota errors (429)
    if (error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
      return "AI insights are temporarily limited due to high demand. Please refer to local knowledge notes for accessibility details.";
    }
    
    return "Wayly recommends the most accessible path based on your functional movement needs.";
  }
};


