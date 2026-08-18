import { GoogleGenAI } from "@google/genai";
import { VERIFIED_UNAVAILABLE } from "@/lib/constants";
import { assistantSystemPrompt } from "@/lib/ai/system-prompt";
import type { RetrievedChunk } from "@/lib/rag/retriever";

export type AssistantAnswer = {
  answer: string;
  citations: Array<{ title: string; authority: string; url: string; fetchedAt?: string | null; sourceVersionId?: string | null }>;
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

  let text: string;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
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
                  lastUpdated: chunk.lastUpdated,
                  fetchedAt: chunk.fetchedAt,
                  sourceVersionId: chunk.sourceVersionId,
                  verificationState: chunk.verificationState
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
    text = response.text ?? "";
  } catch (error) {
    return {
      ...unavailableAnswer(),
      missingInformation: [`Gemini request failed: ${error instanceof Error ? error.message : "unknown error"}.`]
    };
  }

  try {
    return normalizeAssistantAnswer(JSON.parse(text));
  } catch {
    return unavailableAnswer();
  }
}

/**
 * Gemini's JSON output is not schema-enforced -- it has been observed returning
 * missingInformation as a plain string instead of the required string[], which crashed
 * the client's Array.prototype.map call. Coerce the parsed response into the exact
 * AssistantAnswer shape before it ever reaches the client.
 */
function normalizeAssistantAnswer(raw: unknown): AssistantAnswer {
  const value = (raw ?? {}) as Record<string, unknown>;
  const rawMissingInformation = value.missingInformation;

  const missingInformation = Array.isArray(rawMissingInformation)
    ? rawMissingInformation.filter((item): item is string => typeof item === "string")
    : typeof rawMissingInformation === "string" && rawMissingInformation.length > 0
      ? [rawMissingInformation]
      : [];

  return {
    answer: typeof value.answer === "string" && value.answer.length > 0 ? value.answer : VERIFIED_UNAVAILABLE,
    citations: Array.isArray(value.citations) ? (value.citations as AssistantAnswer["citations"]) : [],
    missingInformation,
    suggestedNextAction: typeof value.suggestedNextAction === "string" ? value.suggestedNextAction : ""
  };
}

export function unavailableAnswer(): AssistantAnswer {
  return {
    answer: VERIFIED_UNAVAILABLE,
    citations: [],
    missingInformation: ["No retrieved verified government source contains the requested answer."],
    suggestedNextAction: "Add or ingest an official government source, then try again."
  };
}

