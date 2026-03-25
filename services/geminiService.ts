import { GoogleGenAI, Type } from "@google/genai";
import { Business, AuditResult } from "../types";

// Initialize the client
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Step 1: Find Businesses using Google Maps Grounding
 * Model: gemini-2.5-flash
 */
export const findBusinesses = async (
  businessType: string,
  location: string
): Promise<{ businesses: Business[]; rawText: string; mapLinks: any[] }> => {
  const ai = getAiClient();
  
  const prompt = `
    Find 30 popular or highly rated ${businessType} businesses in ${location}.
    For each business, provide the Name, Address, Website URL (if available), Rating, and their Google Maps Link.
    
    IMPORTANT: After the list, output a JSON code block containing the data exactly like this:
    \`\`\`json
    [
      {
        "name": "Business Name",
        "address": "Full Address",
        "website": "https://...",
        "rating": 4.5,
        "mapsLink": "https://maps.google.com/..."
      }
    ]
    \`\`\`
    If no website is available in the maps data, use null.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        // Note: toolConfig for location could be added here if we had user coordinates
      },
    });

    const text = response.text || "";
    const mapLinks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // Extract JSON from the response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    let businesses: Business[] = [];

    if (jsonMatch && jsonMatch[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        businesses = parsed.map((b: any, index: number) => ({
          id: `biz-${index}-${Date.now()}`,
          name: b.name,
          address: b.address,
          website: b.website || undefined,
          rating: b.rating,
          type: businessType,
          mapsLink: b.mapsLink || undefined
        }));
      } catch (e) {
        console.error("Failed to parse JSON from Maps response", e);
      }
    }

    return { businesses, rawText: text, mapLinks };
  } catch (error) {
    console.error("Error finding businesses:", error);
    throw error;
  }
};

/**
 * Step 2: Audit Website using Google Search Grounding
 * Model: gemini-3-flash-preview
 * Checks if the website is outdated, mobile friendly, etc.
 */
export const auditBusiness = async (
  business: Business
): Promise<{ result: AuditResult; sources: any[] }> => {
  const ai = getAiClient();

  const query = business.website
    ? `Analyze the website ${business.website} for ${business.name}.`
    : `Search for the web presence of ${business.name} in ${business.address}.`;

  const prompt = `
    ${query}
    Determine if this business needs a new website. 
    Look for signs like: outdated design (copyright old, old styling), not mobile friendly, slow loading, or simply NO website found.
    
    Return a JSON response with the following schema:
    {
      "isOutdated": boolean,
      "score": number (1-10, where 10 is URGENTLY needs new site),
      "summary": "Short explanation of findings",
      "technologies": ["Wordpress", "Wix", "None", etc],
      "mobileFriendly": boolean (estimate)
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isOutdated: { type: Type.BOOLEAN },
            score: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
            mobileFriendly: { type: Type.BOOLEAN },
          },
          required: ["isOutdated", "score", "summary"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}") as AuditResult;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { result, sources };
  } catch (error) {
    console.error("Error auditing business:", error);
    throw error;
  }
};

/**
 * Step 3: Generate Sales Pitch using Thinking Mode
 * Model: gemini-3-pro-preview
 * High budget thinking for a personalized strategy.
 */
export const generateProposal = async (
  business: Business,
  audit: AuditResult
): Promise<string> => {
  const ai = getAiClient();

  const prompt = `
    Act as a world-class web design sales consultant.
    I need a cold email/proposal for:
    Business: ${business.name}
    Current Situation: ${audit.summary}
    Outdated Score: ${audit.score}/10
    
    Write a compelling, high-converting outreach email.
    Analyze their specific industry (${business.type}) and how a better website improves their bottom line.
    Be empathetic but authoritative.
    
    Structure:
    1. Subject Line (3 options)
    2. The Email Body
    3. A brief strategic note on why this angle was chosen.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 32768, // Max budget for deep reasoning
        },
      },
    });

    return response.text || "Could not generate proposal.";
  } catch (error) {
    console.error("Error generating proposal:", error);
    throw error;
  }
};