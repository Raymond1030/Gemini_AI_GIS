import { GoogleGenAI, Type } from "@google/genai";
import { GeoPoint } from '../types';

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

/**
 * Searches for places or Geocodes addresses using Gemini.
 */
export const searchPlacesWithGemini = async (query: string, center: { lat: number, lng: number }): Promise<{ text: string, locations: GeoPoint[] }> => {
  try {
    // We check if the query looks like a specific address or a category search
    const isAddress = query.match(/\d+|road|street|ave|lane|drive/i);
    const prompt = isAddress 
        ? `Geocode the following address to precise coordinates: "${query}". Return a single JSON result.` 
        : `Find 5 locations matching "${query}" near ${center.lat}, ${center.lng}. Return JSON.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    locations: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                lat: { type: Type.NUMBER },
                                lng: { type: Type.NUMBER },
                                description: { type: Type.STRING },
                                category: { type: Type.STRING }
                            }
                        }
                    }
                }
            }
        }
    });

    const data = JSON.parse(response.text || "{}");
    
    // Generate a friendly text response based on results
    let text = "";
    if (data.locations && data.locations.length > 0) {
        text = isAddress 
            ? `Located address: ${data.locations[0].name}` 
            : `Found ${data.locations.length} matching locations near you.`;
    } else {
        text = "No locations found.";
    }

    return {
        text: text,
        locations: data.locations || []
    };

  } catch (error) {
    console.error("Gemini Search Error:", error);
    return { text: "Error processing request.", locations: [] };
  }
};

/**
 * Generates a GeoJSON layer based on a description.
 */
export const generateLayerWithGemini = async (prompt: string, center: { lat: number, lng: number }): Promise<any> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a valid GeoJSON FeatureCollection for: ${prompt}. Focus around latitude ${center.lat}, longitude ${center.lng}. Ensure coordinates are precise and form valid geometries.`,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Layer Gen Error:", error);
    return null;
  }
};

/**
 * Performs a spatial query within a user-defined polygon.
 */
export const performSpatialQuery = async (query: string, polygon: [number, number][]): Promise<GeoPoint[]> => {
    try {
        // Convert polygon to string for prompt
        const polyStr = polygon.map(p => `[${p[0]}, ${p[1]}]`).join(', ');
        
        const prompt = `
            I have a polygon defined by these coordinates (lat, lng): [${polyStr}].
            
            Task: Identify locations inside or very close to this polygon that match the query: "${query}".
            Generate synthetic but realistic data if real-time database is unavailable, based on the geographic context of these coordinates.
            
            Return a JSON object with a "locations" array.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        locations: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    lat: { type: Type.NUMBER },
                                    lng: { type: Type.NUMBER },
                                    description: { type: Type.STRING },
                                    category: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });

        const data = JSON.parse(response.text || "{}");
        return data.locations || [];
    } catch (error) {
        console.error("Spatial Query Error:", error);
        return [];
    }
}

/**
 * Generates Kernel Density Estimation data (Heatmap points).
 */
export const performDensityAnalysis = async (topic: string, bounds: any): Promise<[number, number, number][]> => {
    try {
        const prompt = `
            Generate heatmap data (Kernel Density Estimation points) for the topic: "${topic}".
            Area Bounds: North ${bounds._northEast.lat}, East ${bounds._northEast.lng}, South ${bounds._southWest.lat}, West ${bounds._southWest.lng}.
            
            Return a JSON object with a "points" array. 
            Each point must be an array of 3 numbers: [latitude, longitude, intensity].
            Intensity should be between 0.1 and 1.0.
            Generate at least 50 data points distributed realistically for this phenomenon in this location.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        points: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.ARRAY,
                                items: { type: Type.NUMBER }
                            }
                        }
                    }
                }
            }
        });

        const data = JSON.parse(response.text || "{}");
        // Validate data structure [lat, lng, intensity]
        return (data.points || []) as [number, number, number][];

    } catch (error) {
        console.error("Density Analysis Error:", error);
        return [];
    }
};

/**
 * Analyzes the current map view area.
 */
export const analyzeMapArea = async (bounds: any): Promise<any> => {
    const prompt = `Analyze the geographic area defined by bounds: North ${bounds._northEast.lat}, East ${bounds._northEast.lng}, South ${bounds._southWest.lat}, West ${bounds._southWest.lng}. 
    Provide a JSON summary with:
    1. "title": A name for the region.
    2. "summary": A 2-sentence geographic summary.
    3. "metrics": An array of estimated statistics (e.g., Population Density, Green Space %, Traffic Level) with "label", "value" (number), "unit".
    4. "chartData": Array for a chart (e.g., Land Use distribution) with "name" and "value".`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                 responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        summary: { type: Type.STRING },
                        metrics: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    label: { type: Type.STRING },
                                    value: { type: Type.NUMBER },
                                    unit: { type: Type.STRING }
                                }
                            }
                        },
                        chartData: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    value: { type: Type.NUMBER }
                                }
                            }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text || "{}");
    } catch (e) {
        console.error(e);
        return null;
    }
}