// db.js
import pkg from "pg";
const { Pool } = pkg;

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // necessário para Render/Supabase
});

// Teste de conexão
db.on("connect", () => console.log("✅ Conectado ao banco PostgreSQL"));
db.on("error", (err) => console.error("❌ ERRO no banco PostgreSQL:", err));

export default db;
