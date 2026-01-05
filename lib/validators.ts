import { z } from 'zod';

export const IdParamSchema = z.string().min(1);

export const ProductCreateSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  isActive: z.boolean().optional().default(true)
});

export const ProductUpdateSchema = z.object({
  sku: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional()
});

export const WarehouseCreateSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  isActive: z.boolean().optional().default(true)
});

export const WarehouseUpdateSchema = z.object({
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional()
});

export const SupplierCreateSchema = z.object({
  code: z.string().min(1).optional(),
  name: z.string().min(1),
  isActive: z.boolean().optional().default(true)
});

export const SupplierUpdateSchema = z.object({
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional()
});

export const InventoryTrxTypeSchema = z.enum([
  'RECEIPT',
  'ISSUE',
  'TRANSFER_IN',
  'TRANSFER_OUT',
  'ADJUSTMENT'
]);

export const InventoryTransactionCreateSchema = z
  .object({
    warehouseId: z.string().min(1),
    productId: z.string().min(1),
    trxType: InventoryTrxTypeSchema,
    qty: z.number().positive(),
    signedQty: z.number().optional(),
    note: z.string().optional().default(''),
    reference: z.string().optional()
  })
  .superRefine((val, ctx) => {
    if (val.trxType === 'ADJUSTMENT' && typeof val.signedQty !== 'number') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'signedQty is required for ADJUSTMENT'
      });
    }
  });

export const InventoryBalanceQuerySchema = z.object({
  warehouseId: z.string().min(1),
  productId: z.string().min(1)
});

// Minimal schema for administrative upsert of inventory balance
export const InventoryBalanceUpsertSchema = z
  .object({
    warehouseId: z.string().min(1),
    productId: z.string().min(1),
    qtyOnHand: z.number().nonnegative().optional(),
    qtyReserved: z.number().nonnegative().optional(),
    safetyStock: z.number().nonnegative().optional(),
    reorderPoint: z.number().nonnegative().optional()
  })
  .refine(
    (v) =>
      typeof v.qtyOnHand === 'number' ||
      typeof v.qtyReserved === 'number' ||
      typeof v.safetyStock === 'number' ||
      typeof v.reorderPoint === 'number',
    { message: 'At least one of qtyOnHand, qtyReserved, safetyStock, reorderPoint must be provided' }
  );

export const PurchaseOrderItemSchema = z.object({
  productId: z.string().min(1),
  qtyOrdered: z.number().positive()
});

export const PurchaseOrderCreateSchema = z.object({
  supplierId: z.string().min(1),
  items: z.array(PurchaseOrderItemSchema).nonempty(),
  orderedAt: z.string().datetime().optional()
});

export const POReceiveSchema = z.object({
  // Optional explicit receive map; if omitted, receive all remaining
  items: z
    .array(
      z.object({
        itemId: z.string().min(1),
        qtyToReceive: z.number().positive()
      })
    )
    .optional()
});

export const PurchaseOrderItemCreateSchema = z.object({
  poId: z.string().min(1),
  productId: z.string().min(1),
  qtyOrdered: z.number().positive(),
  unitCost: z.number().nonnegative(),
  qtyReceived: z.number().nonnegative().optional()
});

export type InventoryTrxType = z.infer<typeof InventoryTrxTypeSchema>;
