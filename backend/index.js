// backend/index.js
import express from "express";
import cors from "cors";
import pkg from "pg";
const { Pool } = pkg;

import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import productRoutes from "./routes/products.routes.js";

const app = express();

// ================== CORS (CORREÇÃO DEFINITIVA) ==================
const allowedOrigins = [
  "http://localhost:5173", // Vite local
];

app.use(cors({
  origin: (origin, callback) => {
    // Permite Postman / server-side
    if (!origin) return callback(null, true);

    // Permite QUALQUER projeto do Vercel
    if (origin.endsWith(".vercel.app") || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Não permitido por CORS"));
  },
  credentials: true,
}));

// 🔴 OBRIGATÓRIO PARA NÃO DAR 405 / CORS
app.options("*", cors());

// ================== BODY PARSER ==================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================== POSTGRES (RENDER) ==================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Teste de conexão
pool.connect()
  .then(() => console.log("Banco conectado com sucesso"))
  .catch(err => console.error("Erro no banco:", err));

// ================== ROTAS ==================
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/products", productRoutes);

// Rota teste
app.get("/", (req, res) => {
  res.send("API ONLINE 🚀");
});

// ================== START ==================
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API rodando na porta ${PORT}`);
});

// ================== EXPORT ==================
export { pool };
