# Skema API — Inventory & Purchase Orders (Next.js + Prisma)

Dokumen ini untuk developer backend/frontend yang akan mengonsumsi API. Proyek menggunakan Next.js 14 App Router (Node.js runtime) dan Prisma dengan database PostgreSQL (schema: `factory`). Tidak ada migrasi; tabel sudah ada di DB (introspection-only).

- Base URL (Prod): ganti dengan domain deploy Vercel Anda, contoh: `https://serverless-twg8.vercel.app`
- Base URL (Lokal): `http://localhost:3000`
- Content-Type: semua request body gunakan `application/json`
- Auth: tidak disediakan (tambahkan sesuai kebutuhan proyek)

## Health
- GET `/api/health`
- Response 200
```json
{ "ok": true, "db": "ok" }
```

## Products
Model di DB diasumsikan memiliki field umum seperti: `id`, `sku`, `name`, `isActive`, `createdAt`. Sesuaikan dengan hasil Prisma introspection Anda.

- GET `/api/products`
  - Response 200: array of Product
- POST `/api/products`
  - Body
  ```json
  { "sku": "SKU-1", "name": "Produk A", "isActive": true }
  ```
  - Response 201: Product
- GET `/api/products/{productId}`
  - Response 200: Product | 404 jika tidak ditemukan
- PUT `/api/products/{productId}`
  - Body (partial)
  ```json
  { "sku": "SKU-1A", "name": "Produk A+", "isActive": true }
  ```
  - Response 200: Product
- DELETE `/api/products/{productId}`
  - Response 200: `{ "ok": true }`

Contoh curl:
```
curl -X POST $BASE/api/products \
  -H "Content-Type: application/json" \
  -d '{"sku":"SKU-1","name":"Produk A"}'
```

## Warehouses
Asumsi field umum: `id`, `code`, `name`, `isActive`, `createdAt`.

- GET `/api/warehouses`
  - Response 200: array of Warehouse
- POST `/api/warehouses`
  - Body
  ```json
  { "code": "WH1", "name": "Gudang Utama", "isActive": true }
  ```
  - Response 201: Warehouse
- PUT `/api/warehouses?id={warehouseId}` (atau body `{ id: string, ...update }`)
  - Body (partial)
  ```json
  { "name": "Gudang A" }
  ```
  - Response 200: Warehouse
- DELETE `/api/warehouses?id={warehouseId}` (atau body `{ id: string }`)
  - Response 200: `{ "ok": true }`

## Suppliers
Asumsi field umum: `id`, `code`, `name`, `isActive`, `createdAt`.

- GET `/api/suppliers`
  - Response 200: array of Supplier
- POST `/api/suppliers`
  - Body
  ```json
  { "code": "SUP1", "name": "PT Supplier", "isActive": true }
  ```
  - Response 201: Supplier
- PUT `/api/suppliers?id={supplierId}` (atau body `{ id: string, ...update }`)
  - Body (partial)
  ```json
  { "name": "PT Supplier A" }
  ```
  - Response 200: Supplier
- DELETE `/api/suppliers?id={supplierId}` (atau body `{ id: string }`)
  - Response 200: `{ "ok": true }`

## Inventory Balance
Merepresentasikan saldo per `warehouseId` + `productId`.

- GET `/api/inventory/balance?warehouseId={id}&productId={id}`
  - Response 200: InventoryBalance | `null` jika belum ada
  - Asumsi field: `id`, `warehouseId`, `productId`, `qtyOnHand`

Contoh curl:
```
curl "$BASE/api/inventory/balance?warehouseId=<whId>&productId=<prodId>"
```

## Inventory Transactions
Membuat transaksi dan otomatis update saldo secara atomik.

- POST `/api/inventory/transactions`
  - Body
  ```json
  {
    "warehouseId": "<whId>",
    "productId": "<prodId>",
    "trxType": "RECEIPT",
    "qty": 10,
    "signedQty": 10,
    "note": "optional",
    "reference": "optional"
  }
  ```
  - Response 201
  ```json
  {
    "delta": 10,
    "transaction": { /* record InventoryTransaction */ }
  }
  ```

Aturan bisnis transaksi:
- Jika `signedQty` ada → dipakai langsung.
- Jika `signedQty` kosong → tanda berdasarkan `trxType`:
  - `RECEIPT`, `TRANSFER_IN` → +qty
  - `ISSUE`, `TRANSFER_OUT` → -qty
  - `ADJUSTMENT` → harus isi `signedQty` (boleh + atau -)
- `qtyOnHand` TIDAK boleh menjadi negatif.
- Jika belum ada `InventoryBalance`, akan dibuat (delta saat create tidak boleh negatif).

## Purchase Orders
Header + item, dan proses penerimaan yang membuat transaksi `RECEIPT` per item.

- POST `/api/purchase-orders`
  - Body
  ```json
  {
    "supplierId": "<supplierId>",
    "items": [ { "productId": "<prodId>", "qtyOrdered": 5 } ],
    "orderedAt": "2025-01-01T00:00:00.000Z"
  }
  ```
  - Response 201: PO + items

- POST `/api/purchase-orders/{poId}/receive`
  - Body (opsional; tanpa body = auto terima semua sisa)
  ```json
  {
    "items": [ { "itemId": "<poItemId>", "qtyToReceive": 3 } ]
  }
  ```
  - Efek:
    - Update `qtyReceived` di item
    - Buat `InventoryTransaction` tipe `RECEIPT` untuk setiap penerimaan
    - Update status PO menjadi `RECEIVED` jika seluruh item terpenuhi, selain itu tetap `OPEN`

Catatan penting penerimaan:
- Implementasi menerima memakai `purchaseOrder.warehouseId` untuk menentukan gudang tujuan stok. Pastikan kolom tersebut ada dan terisi pada PO sebelum melakukan receive. Jika belum, minta backend menambahkan dukungan `warehouseId` saat create PO atau tentukan gudang pada level item sesuai skema DB.

## Error Handling
- Validasi/business error: 400, body `{ "message": "..." }`
- Not found: 404, body `{ "message": "Not found" }`
- Lainnya: 500, body `{ "message": "Error" }`

## Contoh Rapid Test (curl)
```
# Health
curl $BASE/api/health

# Tambah produk
curl -X POST $BASE/api/products -H "Content-Type: application/json" \
  -d '{"sku":"SKU-1","name":"Produk A"}'

# Tambah gudang
curl -X POST $BASE/api/warehouses -H "Content-Type: application/json" \
  -d '{"code":"WH1","name":"Gudang Utama"}'

# Tambah supplier
curl -X POST $BASE/api/suppliers -H "Content-Type: application/json" \
  -d '{"code":"SUP1","name":"PT Supplier"}'

# Cek saldo (mungkin null jika belum ada transaksi)
curl "$BASE/api/inventory/balance?warehouseId=<whId>&productId=<prodId>"

# Tambah stok 10
curl -X POST $BASE/api/inventory/transactions -H "Content-Type: application/json" \
  -d '{"warehouseId":"<whId>","productId":"<prodId>","trxType":"RECEIPT","qty":10}'
```

## Catatan Integrasi Prisma
- Proyek menggunakan introspeksi: jalankan `prisma db pull` untuk menghasilkan model sesuai DB Anda.
- Jika nama model/field hasil introspeksi berbeda dari asumsi di atas, sesuaikan query pada handler API.
- Prisma Client dibuat singleton untuk mencegah masalah koneksi saat hot-reload.

---
Jika Anda membutuhkan field tambahan (mis. `warehouseId` saat create PO), beri tahu tim backend untuk menambahkan dukungan pada endpoint terkait.
