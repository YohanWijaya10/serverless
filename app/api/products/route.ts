import { getPrisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ProductCreateSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET() {
  const prisma = getPrisma();
  const items = await (prisma as any).product.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const prisma = getPrisma();
  const data = await req.json();
  const parsed = ProductCreateSchema.parse(data);
  const item = await (prisma as any).product.create({ data: parsed });
  return NextResponse.json(item, { status: 201 });
}
