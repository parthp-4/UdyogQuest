import { GoogleGenAI } from "@google/genai";
import { VERIFIED_UNAVAILABLE } from "@/lib/constants";

export type DocumentExtractionResult = {
  documentType: string;
  expiry: string;
  missingPages: string[];
  incorrectFields: string[];
  mismatches: string[];
  extractedFields: Record<string, string>;
  suggestedCorrections: string[];
};

export async function extractDocumentWithGemini(file: File): Promise<DocumentExtractionResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return unavailableExtraction("Gemini API key is not configured.");

  const ai = new GoogleGenAI({ apiKey });
  const bytes = Buffer.from(await file.arrayBuffer());

  let text: string;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                "Extract only visible facts from this uploaded business document. Return JSON with documentType, expiry, missingPages, incorrectFields, mismatches, extractedFields, suggestedCorrections. If a field is not visible, use the exact unavailable sentence."
            },
            {
              inlineData: {
                mimeType: file.type || "application/octet-stream",
                data: bytes.toString("base64")
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0
      }
    });
    text = response.text ?? "";
  } catch (error) {
    return unavailableExtraction(`Gemini Vision request failed: ${error instanceof Error ? error.message : "unknown error"}.`);
  }

  try {
    return JSON.parse(text) as DocumentExtractionResult;
  } catch {
    return unavailableExtraction("Gemini Vision response could not be parsed.");
  }
}

function unavailableExtraction(reason: string): DocumentExtractionResult {
  return {
    documentType: VERIFIED_UNAVAILABLE,
    expiry: VERIFIED_UNAVAILABLE,
    missingPages: [reason],
    incorrectFields: [],
    mismatches: [],
    extractedFields: {},
    suggestedCorrections: [VERIFIED_UNAVAILABLE]
  };
}

