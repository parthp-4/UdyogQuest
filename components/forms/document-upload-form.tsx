"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { VERIFIED_UNAVAILABLE } from "@/lib/constants";

type UploadResult = {
  extraction?: {
    documentType: string;
    expiry: string;
    missingPages: string[];
    incorrectFields: string[];
    mismatches: string[];
    extractedFields: Record<string, string>;
    suggestedCorrections: string[];
  };
  error?: string;
};

export function DocumentUploadForm({ profileId }: { profileId: string }) {
  const [result, setResult] = useState<UploadResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function upload(formData: FormData) {
    setLoading(true);
    try {
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData
      });
      setResult(await response.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-4">
      <form action={upload} className="grid gap-4">
        <input type="hidden" name="profileId" value={profileId} />
        <input className="rounded-md border bg-card p-3 text-sm" type="file" name="file" accept=".pdf,.png,.jpg,.jpeg" required />
        <Button className="w-fit" type="submit" disabled={loading}>
          {loading ? "Extracting..." : "Upload and extract"}
        </Button>
      </form>
      {result ? (
        <div className="grid gap-3 rounded-lg border bg-secondary/40 p-4 text-sm">
          {result.error ? <p className="text-destructive">{result.error}</p> : null}
          <p><strong>Document type:</strong> {result.extraction?.documentType ?? VERIFIED_UNAVAILABLE}</p>
          <p><strong>Expiry:</strong> {result.extraction?.expiry ?? VERIFIED_UNAVAILABLE}</p>
          <p><strong>Mismatches:</strong> {result.extraction?.mismatches?.join(", ") || VERIFIED_UNAVAILABLE}</p>
          <p><strong>Suggested corrections:</strong> {result.extraction?.suggestedCorrections?.join(", ") || VERIFIED_UNAVAILABLE}</p>
        </div>
      ) : null}
    </div>
  );
}

