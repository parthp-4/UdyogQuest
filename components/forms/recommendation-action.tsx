"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function RecommendationAction({ profileId }: { profileId: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function evaluate() {
    setLoading(true);
    try {
      const response = await fetch("/api/recommendations/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId })
      });
      const data = await response.json();
      setMessage(response.ok ? `${data.recommendations.length} source-backed recommendations generated.` : data.error || "Could not evaluate recommendations.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="button" onClick={evaluate} disabled={loading}>
        {loading ? "Evaluating verified rules..." : "Evaluate recommendations"}
      </Button>
      {message ? <span className="text-sm text-muted-foreground">{message}</span> : null}
    </div>
  );
}

