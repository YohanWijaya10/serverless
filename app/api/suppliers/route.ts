import { getPrisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import {
  IdParamSchema,
  SupplierCreateSchema,
  SupplierUpdateSchema,
} from "@/lib/validators";

export const runtime = "nodejs";

export async function GET() {
  const prisma = getPrisma();
  const items = await (prisma as any).supplier.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const prisma = getPrisma();
  const data = SupplierCreateSchema.parse(await req.json());
  const item = await (prisma as any).supplier.create({ data });
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const prisma = getPrisma();
  const url = new URL(req.url);
  const id =
    url.searchParams.get("id") || (await req.json().catch(() => ({}))).id;
  const supplierId = IdParamSchema.parse(id);
  const body = await req.json().catch(() => ({}));
  const data = SupplierUpdateSchema.parse(body);
  const item = await (prisma as any).supplier.update({
    where: { id: supplierId },
    data,
  });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  const prisma = getPrisma();
  const url = new URL(req.url);
  const id =
    url.searchParams.get("id") || (await req.json().catch(() => ({}))).id;
  const supplierId = IdParamSchema.parse(id);
  await (prisma as any).supplier.delete({ where: { id: supplierId } });
  return NextResponse.json({ ok: true });
}
