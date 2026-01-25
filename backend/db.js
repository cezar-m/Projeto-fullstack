// db.js
import pkg from "pg";
const { Pool } = pkg;

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // necessário para Render/Vercel/Supabase
});

// seta o schema padrão
db.query("SET search_path TO sistema_admin")
  .then(() => console.log("🔹 Schema sistema_admin definido"))
  .catch(err => console.error("❌ Erro ao definir schema:", err));

db.on("connect", () => console.log("✅ Conectado ao banco PostgreSQL"));
db.on("error", (err) => console.error("❌ ERRO no banco PostgreSQL:", err));

export default db;
