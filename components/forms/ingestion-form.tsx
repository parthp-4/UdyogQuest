"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function IngestionForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    try {
      const payload = {
        officialUrl: String(formData.get("officialUrl")),
        authorityName: String(formData.get("authorityName")),
        authorityWebsite: String(formData.get("authorityWebsite") || "") || undefined,
        title: String(formData.get("title")),
        kind: String(formData.get("kind")),
        industry: String(formData.get("industry")) || undefined,
        stateApplicability: String(formData.get("stateApplicability") || "") || undefined,
        districtApplicability: String(formData.get("districtApplicability") || "") || undefined
      };
      const response = await fetch("/api/ingest/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      setMessage(response.ok ? data.message ?? "The curated official-source corpus is already loaded." : data.error || "Runtime ingestion is disabled for this demo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={submit} className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Field name="officialUrl" label="Official URL" />
        <Field name="authorityName" label="Authority" />
        <Field name="authorityWebsite" label="Authority website" />
        <Field name="title" label="Title" />
        <label className="grid gap-2 text-sm font-medium">
          Source type
          <select name="kind" className="h-10 rounded-md border bg-card px-3">
            <option value="WEB_PAGE">Web page</option>
            <option value="PDF">PDF</option>
            <option value="CIRCULAR">Circular</option>
            <option value="NOTIFICATION">Notification</option>
            <option value="FAQ">FAQ</option>
            <option value="PORTAL">Portal</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Industry
          <select name="industry" className="h-10 rounded-md border bg-card px-3">
            <option value="">Not tagged</option>
            <option value="FOOD">Food</option>
            <option value="EXPORT_IMPORT">Export / Import</option>
          </select>
        </label>
        <Field name="stateApplicability" label="State applicability" />
        <Field name="districtApplicability" label="District applicability" />
      </div>
      <Button type="submit" className="w-fit" disabled={loading}>
        {loading ? "Checking demo corpus..." : "Check demo corpus"}
      </Button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </form>
  );
}

function Field({ name, label }: { name: string; label: string }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <Input name={name} />
    </label>
  );
}
