# Next.js API Backend (Prisma + PostgreSQL)

Backend-only Next.js 14 (App Router) project using TypeScript and Prisma ORM against an existing PostgreSQL schema `factory` (e.g., Neon). No migrations are created — use Prisma introspection only.

## Requirements Recap
- Next.js 14+ App Router.
- Prisma ORM connected to PostgreSQL. Tables already exist in schema `factory`.
- Introspection only: `prisma db pull` then `prisma generate`.
- Prisma Client singleton to avoid hot-reload issues.
- Endpoints implement inventory business rules with atomic transactions.

## Environment
- `DATABASE_URL`: PostgreSQL connection string including `?schema=factory` (Neon recommended).

Example `.env` (see `.env.example`):
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME?schema=factory&sslmode=require"
```

## Local Development
1) Install deps
```
npm install
```

2) Pull schema from DB (introspect) and generate Prisma client
```
npm run db:pull
npm run prisma:generate
```

3) Run dev server
```
npm run dev
```

API routes are under `/api/*`.

## Folder Structure (key files)
- `app/api/health/route.ts`
- `app/api/products/route.ts`
- `app/api/products/[productId]/route.ts`
- `app/api/warehouses/route.ts`
- `app/api/suppliers/route.ts`
- `app/api/inventory/balance/route.ts`
- `app/api/inventory/transactions/route.ts`
- `app/api/purchase-orders/route.ts`
- `app/api/purchase-orders/[poId]/receive/route.ts`
- `lib/prisma.ts` (Prisma singleton)
- `lib/inventory.ts` (apply delta, prevent negative qtyOnHand)
- `lib/validators.ts` (Zod validators)
- `prisma/schema.prisma` (datasource + generator only; run introspection)

> Note: Model and field names in the handlers assume common names like `product`, `warehouse`, `supplier`, `inventoryBalance`, `inventoryTransaction`, `purchaseOrder`, `purchaseOrderItem` with fields like `id`, `sku`, `name`, `qtyOnHand`, etc. After running `prisma db pull`, adjust field names in the API handlers if your introspected models differ.

## Inventory Rules Implemented
- Insert InventoryTransaction updates InventoryBalance atomically.
- `signedQty` used when provided; otherwise derived from `trxType`:
  - `RECEIPT`, `TRANSFER_IN` => `+qty`
  - `ISSUE`, `TRANSFER_OUT` => `-qty`
  - `ADJUSTMENT` => requires `signedQty` (positive or negative)
- Prevent negative `qtyOnHand` after applying delta.
- Upsert InventoryBalance when missing (creation requires non-negative result).

## Endpoints
- `GET /api/health` => `{ ok: true, db: "ok" }` when DB reachable
- Products CRUD: `GET/POST /api/products`, `GET/PUT/DELETE /api/products/[productId]`
- Warehouses CRUD: `GET/POST/PUT/DELETE /api/warehouses` (PUT/DELETE require `?id=` or body `{ id }`)
- Suppliers CRUD: `GET/POST/PUT/DELETE /api/suppliers` (PUT/DELETE require `?id=` or body `{ id }`)
- `GET /api/inventory/balance?warehouseId=&productId=`
- `POST /api/inventory/transactions` => creates transaction and updates balance atomically
- `POST /api/purchase-orders` => creates PO header + items
- `POST /api/purchase-orders/[poId]/receive` => auto receive: updates item `qtyReceived`, creates `RECEIPT` inventory transactions, updates PO status to `RECEIVED` if fully received

## Vercel Deploy Guide
- Ensure Prisma runs on Node runtime (not Edge). Routes export `runtime = 'nodejs'` already.
- Add `DATABASE_URL` to Vercel Project Settings -> Environment Variables (include `?schema=factory`).
- Push repo to Git and import into Vercel.
- Set build command to default (Next.js). No DB migrations are run.
- After first deploy (or via Vercel shell), run introspection locally and commit `schema.prisma` changes as needed. Deployment only needs generated client; CI can run `prisma generate` if required.

## Notes
- Do NOT run `prisma migrate` in this project.
- If your schema names/columns differ from the assumptions, update the API handlers accordingly after `db pull`.
- Prisma Client is instantiated as a singleton in `lib/prisma.ts` to avoid exhausting connections during hot reload.
# serverless
