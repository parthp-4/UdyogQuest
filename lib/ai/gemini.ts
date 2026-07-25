import { GoogleGenAI } from "@google/genai";
import { VERIFIED_UNAVAILABLE } from "@/lib/constants";
import { assistantSystemPrompt } from "@/lib/ai/system-prompt";
import type { RetrievedChunk } from "@/lib/rag/retriever";

export type AssistantAnswer = {
  answer: string;
  citations: Array<{ title: string; authority: string; url: string }>;
  missingInformation: string[];
  suggestedNextAction: string;
};

export async function askGeminiFromSources(question: string, chunks: RetrievedChunk[]): Promise<AssistantAnswer> {
  if (chunks.length === 0) {
    return unavailableAnswer();
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      ...unavailableAnswer(),
      missingInformation: ["Gemini API key is not configured on the server."]
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          { text: assistantSystemPrompt },
          {
            text: JSON.stringify({
              question,
              retrievedSources: chunks.map((chunk) => ({
                content: chunk.content,
                title: chunk.sourceTitle,
                authority: chunk.authority,
                officialUrl: chunk.officialUrl,
                lastUpdated: chunk.lastUpdated
              }))
            })
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      temperature: 0
    }
  });

  const text = response.text ?? "";
  try {
    return JSON.parse(text) as AssistantAnswer;
  } catch {
    return unavailableAnswer();
  }
}

export function unavailableAnswer(): AssistantAnswer {
  return {
    answer: VERIFIED_UNAVAILABLE,
    citations: [],
    missingInformation: ["No retrieved verified government source contains the requested answer."],
    suggestedNextAction: "Add or ingest an official government source, then try again."
  };
}

