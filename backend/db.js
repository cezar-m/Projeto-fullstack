import pkg from "pg";
const { Pool } = pkg;

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Define schema padrão para **cada nova conexão**
db.on("connect", async (client) => {
  try {
    await client.query('SET search_path TO sistema_admin');
    console.log("🔹 Schema sistema_admin definido");
  } catch (err) {
    console.error("❌ ERRO ao definir schema:", err);
  }
});

db.on("error", (err) => console.error("❌ ERRO no banco PostgreSQL:", err));

export default db;
