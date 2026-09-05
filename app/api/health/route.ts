import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { log } from "@/lib/log";

/** Usado pelo healthcheck do container: só está saudável se o banco responde. */
export async function GET() {
  const inicio = Date.now();
  try {
    const { rows } = await pool().query<{ artigos: string }>(
      "SELECT count(*)::text AS artigos FROM articles"
    );
    return NextResponse.json({
      status: "ok",
      banco: "ok",
      artigos: Number(rows[0]?.artigos ?? 0),
      latenciaMs: Date.now() - inicio,
    });
  } catch (erro) {
    log.erro("health.banco_indisponivel", erro);
    return NextResponse.json({ status: "degradado", banco: "indisponivel" }, { status: 503 });
  }
}
