# ERD — Inventory & Purchasing

Diagram ini dihasilkan dari `prisma/schema.prisma`. Render dengan viewer Mermaid (GitHub, VS Code extension, atau mermaid.live).

```mermaid
erDiagram
  PRODUCT {
    STRING productId PK
    STRING sku UNIQUE NULL
    STRING name
    STRING category NULL
    STRING uom "default: pcs"
    BOOLEAN isActive "default: true"
    DATETIME createdAt "default: now()"
  }

  WAREHOUSE {
    STRING warehouseId PK
    STRING name
    STRING location NULL
    BOOLEAN isActive "default: true"
    DATETIME createdAt "default: now()"
  }

  SUPPLIER {
    STRING supplierId PK
    STRING name
    STRING phone NULL
    STRING address NULL
    INT termsDays "default: 0"
    BOOLEAN isActive "default: true"
    DATETIME createdAt "default: now()"
  }

  PURCHASE_ORDER {
    STRING poId PK
    STRING supplierId FK
    DATETIME poDate "default: now()"
    DATETIME expectedDate NULL
    ENUM status "POStatus, default: DRAFT"
    STRING currency "default: IDR"
    STRING notes NULL
    DATETIME createdAt "default: now()"
    DATETIME updatedAt
  }

  PURCHASE_ORDER_ITEM {
    BIGINT poItemId PK
    STRING poId FK
    STRING productId FK
    DECIMAL qtyOrdered "18,3"
    DECIMAL unitCost "18,2"
    DECIMAL qtyReceived "18,3, default: 0"
    DATETIME createdAt "default: now()"
    UNIQUE "(poId, productId)"
  }

  INVENTORY_BALANCE {
    STRING warehouseId PK
    STRING productId PK
    DECIMAL qtyOnHand "18,3, default: 0"
    DECIMAL qtyReserved "18,3, default: 0"
    DECIMAL safetyStock "18,3, default: 0"
    DECIMAL reorderPoint "18,3, default: 0"
    DATETIME updatedAt "default: now()"
    INDEX "(productId)"
  }

  INVENTORY_TRANSACTION {
    BIGINT trxId PK
    DATETIME trxDate "default: now()"
    STRING warehouseId FK
    STRING productId FK
    ENUM trxType "InventoryTrxType"
    DECIMAL qty "18,3"
    DECIMAL signedQty "18,3, NULL"
    STRING refType NULL
    STRING refId NULL
    STRING note NULL
    DATETIME createdAt "default: now()"
    INDEX "(productId, trxDate DESC)"
    INDEX "(trxDate DESC)"
    INDEX "(warehouseId, productId, trxDate DESC)"
  }

  %% Relationships
  PRODUCT ||--o{ INVENTORY_BALANCE : has
  WAREHOUSE ||--o{ INVENTORY_BALANCE : has

  PRODUCT ||--o{ INVENTORY_TRANSACTION : has
  WAREHOUSE ||--o{ INVENTORY_TRANSACTION : has

  SUPPLIER ||--o{ PURCHASE_ORDER : has
  PURCHASE_ORDER ||--o{ PURCHASE_ORDER_ITEM : has
  PRODUCT ||--o{ PURCHASE_ORDER_ITEM : has
```

Catatan:
- ENUM `InventoryTrxType`: RECEIPT, ISSUE, ADJUSTMENT, TRANSFER_IN, TRANSFER_OUT
- ENUM `POStatus`: DRAFT, SUBMITTED, APPROVED, RECEIVED, CLOSED, CANCELED

