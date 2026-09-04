import { NextResponse } from "next/server";
import { getHomeData } from "@/lib/home";

export async function GET() {
  return NextResponse.json(getHomeData());
}
