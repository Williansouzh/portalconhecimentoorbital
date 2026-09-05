import { NextResponse } from "next/server";
import { getCategories } from "@/lib/categories";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const categories = await getCategories();
  return NextResponse.json({ categories, total: categories.reduce((n, c) => n + c.count, 0) });
}
