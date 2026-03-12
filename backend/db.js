import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // ⚡ obrigatório no Render
  max: 5, // limite de conexões
});

// Reconectar automaticamente se a conexão cair
db.on("error", async (err) => {
  console.error("❌ Erro de conexão com o banco:", err.message);
  try {
    await db.connect();
    console.log("🔄 Reconectado ao banco!");
  } catch (e) {
    console.error("❌ Falha ao reconectar:", e.message);
  }
});

export default db;

