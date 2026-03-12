import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // obrigatório para Supabase
});

pool.query("SELECT NOW()")
  .then(res => console.log("Conectado ao banco Supabase:", res.rows[0]))
  .catch(err => console.error("Erro de conexão:", err));
