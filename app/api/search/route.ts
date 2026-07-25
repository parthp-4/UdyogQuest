import { NextResponse } from "next/server";
import { globalSearch } from "@/lib/search/search";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";
  const results = await globalSearch(query);
  return NextResponse.json({ results });
}

