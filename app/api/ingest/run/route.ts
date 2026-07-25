import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    results: [],
    message: "Runtime ingestion is disabled for the demo. The curated official-source corpus is already loaded."
  });
}

export async function GET() {
  return NextResponse.json({
    results: [],
    message: "Runtime ingestion is disabled for the demo. The curated official-source corpus is already loaded."
  });
}
