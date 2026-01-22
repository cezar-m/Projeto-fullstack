// backend/index.js
import express from "express";
import cors from "cors";
import pkg from "pg"; // Postgres
const { Pool } = pkg;

import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import productRoutes from "./routes/products.routes.js";

const app = express();

// ================== CORS ==================
// Lista de frontends permitidos
const allowedOrigins = [
  "http://localhost:5173", // Vite dev
  "https://projeto-fullstack-delta.vercel.app",
  "https://projeto-fullstack-peach.vercel.app",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // permite Postman ou server-side requests
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Não permitido por CORS"));
    }
  },
  credentials: true,
}));

// ================== BODY PARSER ==================
app.use(express.json()); // para JSON no body
app.use(express.urlencoded({ extended: true })); // para forms

// ================== POSTGRES ==================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // URL do Render
  ssl: { rejectUnauthorized: false }, // obrigatório no Render
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

// ================== START DO SERVIDOR ==================
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API rodando na porta ${PORT}`);
});

// ================== EXPORT ==================
export { pool };

