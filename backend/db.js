import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 🔥 FORÇA O SCHEMA NO MOMENTO DA CONEXÃO
pool.on("connect", async (client) => {
  await client.query("SET search_path TO sistema_admin");
  console.log("✅ Schema definido como sistema_admin");
});

export default pool;
