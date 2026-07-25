"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VERIFIED_UNAVAILABLE } from "@/lib/constants";

type AssistantResponse = {
  answer: string;
  citations: Array<{ title: string; authority: string; url: string }>;
  missingInformation: string[];
  suggestedNextAction: string;
};

export function AssistantPanel() {
  const [question, setQuestion] = useState("What should I do next?");
  const [answer, setAnswer] = useState<AssistantResponse | null>({
    answer:
      "Priya should start with FoSCoS/FSSAI registration and Udyam. The profile is a cloud kitchen in Lucknow with Aadhaar, PAN and bank details available, while food registration and MSME identity are still missing. These two steps unlock a cleaner packet for PMFME, PMEGP, GST checks and local permissions.",
    citations: [
      { title: "FoSCoS - Food Safety Compliance System", authority: "Food Safety and Standards Authority of India", url: "https://foscos.fssai.gov.in/" },
      { title: "Udyam Registration", authority: "Ministry of Micro, Small and Medium Enterprises", url: "https://udyamregistration.gov.in/" },
      { title: "PM Formalisation of Micro Food Processing Enterprises Scheme", authority: "Ministry of Food Processing Industries", url: "https://pmfme.mofpi.gov.in/" }
    ],
    missingInformation: ["Exact FSSAI processing time is not specified in the curated verified corpus."],
    suggestedNextAction: "Create/login on FoSCoS, select relevant registration/license service, enter business and premises details, upload documents, pay portal-displayed fee, submit."
  });
  const [loading, setLoading] = useState(false);

  async function ask() {
    setLoading(true);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });
      setAnswer(await response.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="grid gap-3 rounded-lg border bg-card p-5">
        <label className="text-sm font-semibold">Ask from verified sources</label>
        <Textarea value={question} onChange={(event) => setQuestion(event.target.value)} />
        <Button type="button" onClick={ask} disabled={loading}>
          {loading ? "Retrieving sources..." : "Ask assistant"}
        </Button>
      </div>
      <div className="grid gap-4 rounded-lg border bg-card p-5">
        <h3 className="text-xl font-semibold">Answer</h3>
        <p className="text-sm leading-6 text-muted-foreground">{answer?.answer ?? VERIFIED_UNAVAILABLE}</p>
        <div className="grid gap-2">
          <strong className="text-sm">Citations</strong>
          {answer?.citations?.length ? (
            answer.citations.map((citation) => (
              <a key={citation.url} className="rounded-md border p-3 text-sm hover:bg-secondary" href={citation.url} target="_blank" rel="noreferrer">
                {citation.title} · {citation.authority}
              </a>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">{VERIFIED_UNAVAILABLE}</p>
          )}
        </div>
        <div className="rounded-md bg-secondary p-3 text-sm">
          <strong>Suggested next action</strong>
          <p className="mt-1 text-muted-foreground">{answer?.suggestedNextAction ?? "Ask a question about Priya's food workflow or Rahul's export workflow."}</p>
        </div>
        {answer?.missingInformation?.length ? (
          <div className="rounded-md border p-3 text-sm">
            <strong>Unavailable from verified corpus</strong>
            <ul className="mt-2 list-disc pl-5 text-muted-foreground">
              {answer.missingInformation.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
