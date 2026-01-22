import express from "express";
import cors from "cors";
import pkg from "pg"; // Postgres
const { Pool } = pkg;

import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import productRoutes from "./routes/products.routes.js";

const app = express();

// ================== CORS ==================
app.use(cors({
  origin: "https://projeto-fullstack-delta.vercel.app/", // substitua pela URL do seu frontend
  credentials: true
}));

app.use(express.json()); // para JSON no body

// ================== POSTGRES ==================
// Use process.env.DATABASE_URL com a senha que Render gerou
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // obrigatório no Render
});

pool.connect()
  .then(() => console.log("Banco conectado com sucesso"))
  .catch(err => console.error("Erro no banco:", err));

// ================== ROTAS ==================
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/products", productRoutes);

app.get("/", (req, res) => {
  res.send("API ONLINE 🚀");
});

// ================== START DO SERVIDOR ==================
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API rodando na porta ${PORT}`);
});

export { pool }; // exporta pool se quiser usar nas rotas


