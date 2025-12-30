export const runtime = "nodejs";

import { getPrisma } from "@/lib/prisma";

export async function GET() {
  const prisma = getPrisma();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ ok: true, db: "ok" });
  } catch (err) {
    return Response.json(
      { ok: false, db: "error", message: String(err) },
      { status: 500 }
    );
  }
}
