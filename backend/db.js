// db.js
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

// Configura o SSL apenas em produção
const sslConfig = process.env.NODE_ENV === "production"
  ? { rejectUnauthorized: false }
  : false;

// Cria o pool de conexões
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslConfig
});

// Teste de conexão ao iniciar o servidor
(async () => {
  try {
    const res = await db.query("SELECT NOW()");
    console.log(`✅ Banco conectado! Hora do servidor: ${res.rows[0].now}`);
  } catch (err) {
    console.error("❌ ERRO ao conectar no banco PostgreSQL:", err);
  }
})();

// Eventos do pool
db.on("connect", () => {
  console.log("🔹 Pool de conexões PostgreSQL ativo");
});

db.on("error", (err) => {
  console.error("❌ ERRO no pool PostgreSQL:", err);
});

export default db;
