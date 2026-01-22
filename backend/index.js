// backend/index.js
import express from "express";
import cors from "cors";
import pkg from "pg";
const { Pool } = pkg;

import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import productRoutes from "./routes/products.routes.js";

const app = express();

/* ================== CORS (VERSÃO DEFINITIVA) ================== */
const corsOptions = {
  origin: (origin, callback) => {
    // Permite Postman, server-side e health check
    if (!origin) return callback(null, true);

    // Permite localhost e QUALQUER projeto Vercel
    if (
      origin === "http://localhost:5173" ||
      origin.endsWith(".vercel.app")
    ) {
      return callback(null, true);
    }

    return callback(new Error("Origin não permitida pelo CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* ================== BODY PARSER ================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================== POSTGRES (RENDER) ================== */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Teste de conexão
pool.connect()
  .then(() => console.log("✅ Banco conectado com sucesso"))
  .catch(err => console.error("❌ Erro no banco:", err));

/* ================== ROTAS ================== */
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/products", productRoutes);

/* ================== ROTA TESTE ================== */
app.get("/", (req, res) => {
  res.status(200).send("API ONLINE 🚀");
});

/* ================== START ================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 API rodando na porta ${PORT}`);
});

/* ================== EXPORT ================== */
export { pool };
