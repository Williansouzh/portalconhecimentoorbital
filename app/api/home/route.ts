import { NextResponse } from "next/server";
import { getHomeData } from "@/lib/home";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(await getHomeData(session.id));
}
