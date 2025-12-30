import { getPrisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { PurchaseOrderCreateSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const prisma = getPrisma();
  const body = await req.json();
  const parsed = PurchaseOrderCreateSchema.parse(body);

  const result = await prisma.$transaction(async (tx) => {
    const po = await (tx as any).purchaseOrder.create({
      data: {
        supplierId: parsed.supplierId,
        status: "OPEN",
        orderedAt: parsed.orderedAt ? new Date(parsed.orderedAt) : new Date(),
      },
    });

    const itemsData = parsed.items.map((it) => ({
      poId: po.id,
      productId: it.productId,
      qtyOrdered: it.qtyOrdered,
      qtyReceived: 0,
    }));
    await (tx as any).purchaseOrderItem.createMany({ data: itemsData });

    const items = await (tx as any).purchaseOrderItem.findMany({
      where: { poId: po.id },
    });
    return { ...po, items };
  });

  return NextResponse.json(result, { status: 201 });
}
