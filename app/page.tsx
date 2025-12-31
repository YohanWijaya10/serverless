export default function Page() {
  return (
    <main className="hero">
      <div className="container">
        <header className="header">
          <span className="tag">Serverless API</span>
          <h1>Backend Gudang Next.js</h1>
          <p className="subtitle">
            Bayangkan backend ini seperti sistem gudang modern: ada pintu masuk (endpoint),
            petugas pencatat (handler), rak penyimpanan (database), dan kurir yang mengantar
            nota (response JSON). Semuanya rapi, terukur, dan siap melayani aplikasi front-end.
          </p>
        </header>

        <section className="grid">
          <article className="card">
            <div className="icon">🚪</div>
            <h3>Pintu Gudang (Endpoints)</h3>
            <p>
              Semua akses keluar-masuk barang lewat rute <code>/api/*</code>. Di sini ada
              gerbang untuk cek kesehatan sistem dan mengelola master data gudang.
            </p>
            <div className="links">
              <a href="/api/health" target="_blank" rel="noreferrer">/api/health</a>
              <a href="/api/warehouses" target="_blank" rel="noreferrer">/api/warehouses</a>
              <a href="/api/products" target="_blank" rel="noreferrer">/api/products</a>
              <a href="/api/suppliers" target="_blank" rel="noreferrer">/api/suppliers</a>
              <a href="/api/purchase-orders" target="_blank" rel="noreferrer">/api/purchase-orders</a>
            </div>
          </article>

          <article className="card">
            <div className="icon">🧾</div>
            <h3>Petugas Pencatat (Handlers)</h3>
            <p>
              Setiap pintu dijaga fungsi <code>GET</code>, <code>POST</code>, <code>PUT</code>,
              dan <code>DELETE</code> yang mengatur alur keluar-masuk data. Mereka memeriksa
              format, menyimpan perubahan, lalu membuatkan bukti transaksi.
            </p>
            <p className="muted">Lokasi: <code>app/api/**/route.ts</code></p>
          </article>

          <article className="card">
            <div className="icon">📦</div>
            <h3>Rak & Stok (Database)</h3>
            <p>
              Data disimpan rapi lewat <code>Prisma</code> sebagai ORM, ibarat rak gudang
              yang terstruktur: produk, pemasok, gudang, dan pesanan pembelian (PO).
            </p>
            <p className="muted">Cek util: <code>lib/prisma.ts</code></p>
          </article>

          <article className="card">
            <div className="icon">📮</div>
            <h3>Kurir & Nota (Responses)</h3>
            <p>
              Setiap proses menghasilkan <code>JSON</code> sebagai nota resmi. Front-end
              tinggal membaca dan menampilkan tanpa tahu detil dapur gudang.
            </p>
          </article>
        </section>

        <section className="cta">
          <h2>Coba Cepat</h2>
          <div className="codeList">
            <code>curl -sS http://localhost:3000/api/health</code>
            <code>curl -sS http://localhost:3000/api/warehouses</code>
            <code>curl -sS http://localhost:3000/api/products</code>
          </div>
          <p className="muted small">
            Jalankan saat dev server aktif di <code>localhost:3000</code>.
          </p>
        </section>
      </div>

      <style>{`
        .hero {
          min-height: 100vh;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 48px 24px 64px;
          background: radial-gradient(1200px 600px at 20% -10%, rgba(99,102,241,.25), transparent),
                      radial-gradient(1200px 600px at 80% 0%, rgba(147,51,234,.25), transparent),
                      linear-gradient(180deg, #0b1020 0%, #0f1224 50%, #0b1020 100%);
          color: #e6e6f0;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
        }
        .container { width: 100%; max-width: 980px; }
        .header { text-align: center; margin-bottom: 28px; }
        .tag {
          display: inline-block;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(99,102,241,.18);
          border: 1px solid rgba(99,102,241,.35);
          color: #c7c9ff;
          font-size: 12px;
          letter-spacing: .08em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        h1 { font-size: 36px; line-height: 1.15; margin: 6px 0 10px; }
        .subtitle { color: #b7b9cc; max-width: 820px; margin: 0 auto; }
        .grid {
          display: grid;
          grid-template-columns: repeat(1, minmax(0, 1fr));
          gap: 16px;
          margin-top: 26px;
        }
        @media (min-width: 720px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        .card {
          background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03));
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 14px;
          padding: 18px 18px 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.06);
        }
        .icon { font-size: 24px; margin-bottom: 6px; }
        h3 { margin: 0 0 6px; font-size: 18px; }
        p { margin: 0 0 10px; color: #cfd2e6; }
        .muted { color: #a6aac2; }
        .small { font-size: 12px; }
        .links { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
        .links a {
          color: #d7dbff;
          text-decoration: none;
          border: 1px solid rgba(99,102,241,.35);
          background: rgba(99,102,241,.12);
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
        }
        .links a:hover { background: rgba(99,102,241,.22); }
        .cta { margin-top: 28px; text-align: center; }
        .cta h2 { font-size: 20px; margin-bottom: 10px; }
        .codeList { display: grid; gap: 8px; max-width: 720px; margin: 0 auto; }
        .codeList code {
          display: block;
          text-align: left;
          background: #0a0d19;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 10px;
          padding: 10px 12px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 12.5px;
          color: #dfe2f7;
          overflow-x: auto;
        }
        code { background: rgba(255,255,255,.06); padding: 2px 6px; border-radius: 6px; }
        a code { background: transparent; padding: 0; }
      `}</style>
    </main>
  );
}
