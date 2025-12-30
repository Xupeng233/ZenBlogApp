
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  async suggestTitle(content: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Based on this blog content, suggest a short, catchy title: "${content.substring(0, 500)}..."`,
      });
      return response.text.replace(/["']/g, '').trim();
    } catch (e) {
      console.error(e);
      return "New Untitled Post";
    }
  },

  async expandPost(currentContent: string, instruction: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `I am writing a blog. Here is my draft: "${currentContent}". 
        Please help me with: ${instruction}. 
        Return only the additional text to append.`,
      });
      return response.text;
    } catch (e) {
      console.error(e);
      return "\n(AI failed to generate content)";
    }
  }
};
