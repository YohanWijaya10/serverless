import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { IdParamSchema, WarehouseCreateSchema, WarehouseUpdateSchema } from '@/lib/validators';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const items = await (prisma as any).warehouse.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const data = WarehouseCreateSchema.parse(await req.json());
  const item = await (prisma as any).warehouse.create({ data });
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id') || (await req.json().catch(() => ({}))).id;
  const warehouseId = IdParamSchema.parse(id);
  const body = await req.json().catch(() => ({}));
  const data = WarehouseUpdateSchema.parse(body);
  const item = await (prisma as any).warehouse.update({ where: { id: warehouseId }, data });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id') || (await req.json().catch(() => ({}))).id;
  const warehouseId = IdParamSchema.parse(id);
  await (prisma as any).warehouse.delete({ where: { id: warehouseId } });
  return NextResponse.json({ ok: true });
}

