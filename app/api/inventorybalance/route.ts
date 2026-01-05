import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { toPlain } from '@/lib/json';
import {
  InventoryBalancePatchSchema,
  InventoryBalancePutSchema,
  InventoryBalanceUpsertSchema
} from '@/lib/validators';
import { applyCORS, preflight } from '@/lib/cors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await (prisma as any).inventoryBalance.findMany({
      orderBy: [{ warehouseId: 'asc' }, { productId: 'asc' }]
    });
    return applyCORS(NextResponse.json(toPlain(items)));
  } catch (e: any) {
    return applyCORS(NextResponse.json({ message: e?.message ?? 'Error' }, { status: 500 }));
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = InventoryBalanceUpsertSchema.parse(body);

    const { warehouseId, productId, ...maybeValues } = parsed as any;

    // Build update payload only with provided fields
    const updateData: Record<string, any> = {};
    for (const k of ['qtyOnHand', 'qtyReserved', 'safetyStock', 'reorderPoint'] as const) {
      if (typeof maybeValues[k] === 'number') updateData[k] = maybeValues[k];
    }

    const item = await (prisma as any).inventoryBalance.upsert({
      where: { warehouseId_productId: { warehouseId, productId } },
      create: { warehouseId, productId, ...updateData },
      update: updateData
    });

    return applyCORS(NextResponse.json(toPlain(item), { status: 201 }));
  } catch (e: any) {
    const status = e?.name === 'ZodError' ? 400 : 500;
    return applyCORS(NextResponse.json({ message: e?.message ?? 'Error' }, { status }));
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = InventoryBalancePutSchema.parse(body);

    const { warehouseId, productId, qtyOnHand, qtyReserved, safetyStock, reorderPoint } = parsed;

    const existing = await (prisma as any).inventoryBalance.findUnique({
      where: { warehouseId_productId: { warehouseId, productId } }
    });
    if (!existing) {
      return applyCORS(NextResponse.json({ message: 'Not found' }, { status: 404 }));
    }

    const updated = await (prisma as any).inventoryBalance.update({
      where: { warehouseId_productId: { warehouseId, productId } },
      data: { qtyOnHand, qtyReserved, safetyStock, reorderPoint }
    });
    return applyCORS(NextResponse.json(toPlain(updated)));
  } catch (e: any) {
    const status = e?.name === 'ZodError' ? 400 : 500;
    return applyCORS(NextResponse.json({ message: e?.message ?? 'Error' }, { status }));
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = InventoryBalancePatchSchema.parse(body);
    const { warehouseId, productId, ...maybeValues } = parsed as any;

    const existing = await (prisma as any).inventoryBalance.findUnique({
      where: { warehouseId_productId: { warehouseId, productId } }
    });
    if (!existing) {
      return applyCORS(NextResponse.json({ message: 'Not found' }, { status: 404 }));
    }

    const data: Record<string, any> = {};
    for (const k of ['qtyOnHand', 'qtyReserved', 'safetyStock', 'reorderPoint'] as const) {
      if (typeof maybeValues[k] === 'number') data[k] = maybeValues[k];
    }

    const updated = await (prisma as any).inventoryBalance.update({
      where: { warehouseId_productId: { warehouseId, productId } },
      data
    });
    return applyCORS(NextResponse.json(toPlain(updated)));
  } catch (e: any) {
    const status = e?.name === 'ZodError' ? 400 : 500;
    return applyCORS(NextResponse.json({ message: e?.message ?? 'Error' }, { status }));
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const qsWarehouseId = url.searchParams.get('warehouseId');
    const qsProductId = url.searchParams.get('productId');

    let warehouseId = qsWarehouseId as string | undefined;
    let productId = qsProductId as string | undefined;

    if (!warehouseId || !productId) {
      try {
        const body = await req.json();
        warehouseId = body?.warehouseId ?? warehouseId;
        productId = body?.productId ?? productId;
      } catch {
        // ignore body parse errors; will be validated below
      }
    }

    if (!warehouseId || !productId) {
      return applyCORS(
        NextResponse.json({ message: 'warehouseId and productId are required' }, { status: 400 })
      );
    }

    const existing = await (prisma as any).inventoryBalance.findUnique({
      where: { warehouseId_productId: { warehouseId, productId } }
    });
    if (!existing)
      return applyCORS(NextResponse.json({ message: 'Not found' }, { status: 404 }));

    await (prisma as any).inventoryBalance.delete({
      where: { warehouseId_productId: { warehouseId, productId } }
    });
    return applyCORS(NextResponse.json({ ok: true }));
  } catch (e: any) {
    return applyCORS(NextResponse.json({ message: e?.message ?? 'Error' }, { status: 500 }));
  }
}

export async function OPTIONS() {
  return preflight();
}
