import { VERIFIED_UNAVAILABLE } from "@/lib/constants";

export type SourceBackedText = {
  value: string;
  citations: Array<{
    title: string;
    officialUrl: string;
    authority: string;
    lastUpdated: Date | null;
  }>;
};

export function sourceBacked(value: string | null | undefined, citations: SourceBackedText["citations"]): SourceBackedText {
  if (!value || citations.length === 0) {
    return { value: VERIFIED_UNAVAILABLE, citations: [] };
  }

  return { value, citations };
}

export function requireVerifiedSource<T>(value: T | null | undefined): T | typeof VERIFIED_UNAVAILABLE {
  return value ?? VERIFIED_UNAVAILABLE;
}

