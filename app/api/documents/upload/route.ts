import { NextResponse } from "next/server";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { getDemoExtraction } from "@/lib/demo/corpus";
import { extractDocumentWithGemini } from "@/lib/documents/extract";

function useDemoCorpus() {
  return process.env.NEXT_PUBLIC_DEMO_MODE !== "false" || !isDatabaseConfigured();
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const profileId = String(formData.get("profileId") ?? "");
  const file = formData.get("file");

  if (!profileId || !(file instanceof File)) {
    return NextResponse.json({ error: "profileId and file are required" }, { status: 400 });
  }

  if (useDemoCorpus()) {
    const extraction = getDemoExtraction(file.name);
    return NextResponse.json({
      document: {
        id: `demo-${Date.now()}`,
        profileId,
        fileName: file.name,
        status: "EXTRACTED",
        documentType: extraction.documentType
      },
      extraction
    });
  }

  const extraction = await extractDocumentWithGemini(file);
  const document = await prisma.userDocument.create({
    data: {
      profileId,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      storageUrl: "pending-object-storage",
      status: "EXTRACTED",
      documentType: extraction.documentType,
      expiryDate: extraction.expiry && !Number.isNaN(Date.parse(extraction.expiry)) ? new Date(extraction.expiry) : null,
      extractedFields: extraction.extractedFields,
      missingFields: extraction.missingPages,
      mismatchFlags: [...extraction.incorrectFields, ...extraction.mismatches],
      reuseKey: extraction.documentType
    }
  });

  return NextResponse.json({ document, extraction });
}
