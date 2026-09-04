import { NextResponse } from "next/server";
import { categories } from "@/lib/data";

export async function GET() {
  const total = categories.reduce((n, c) => n + c.count, 0);
  return NextResponse.json({ categories, total });
}
