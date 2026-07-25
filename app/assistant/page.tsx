import { PageHeader } from "@/components/layout/page-shell";
import { AssistantPanel } from "@/components/forms/assistant-panel";

export default function AssistantPage() {
  return (
    <>
      <PageHeader eyebrow="RAG assistant" title="AI Assistant" description="Ask operational questions. Gemini answers only from retrieved verified government sources and cites official URLs." />
      <div className="p-5 lg:p-8">
        <AssistantPanel />
      </div>
    </>
  );
}

