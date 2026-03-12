// db.js
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // 🔑 SSL obrigatório no Render/Supabase
  max: 5, // máximo de conexões simultâneas
});

db.on("error", (err) => {
  console.error("Erro de conexão com o banco:", err);
});

export default db;
