import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import db from "./db.js";
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import productRoutes from "./routes/products.routes.js";

dotenv.config();
const app = express();

/* ================== FIX __dirname ================== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ================== GARANTIR PASTA UPLOADS ================== */
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

/* ================== CORS ================== */
// ✅ Permite requests de qualquer deploy Vercel + localhost + Postman
app.use(cors({
  origin: (origin, callback) => {
    // requests sem origin (Postman, SSR) são permitidos
    if (!origin) return callback(null, true);

    // aceita qualquer deploy do Vercel (https://*.vercel.app)
    if (origin.startsWith("https://") || origin.includes("localhost")) {
      return callback(null, true);
    }

    console.warn("CORS bloqueado:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

/* ================== BODY PARSER ================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================== STATIC FILES ================== */
app.use("/uploads", express.static(uploadsPath));

/* ================== ROTAS ================== */
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/products", productRoutes);

/* ================== CRIAR TABELAS ================== */
const createTables = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS public.usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        acesso VARCHAR(50) NOT NULL
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS public.produtos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        preco DECIMAL(10,2) NOT NULL,
        descricao TEXT,
        quantidade INT DEFAULT 0,
        imagem VARCHAR(255),
        id_usuario INT REFERENCES public.usuarios(id)
      )
    `);

    console.log("✅ Tabelas criadas/verificadas com sucesso!");
  } catch (err) {
    console.error("❌ ERRO ao criar tabelas:", err);
  }
};

createTables();

/* ================== TESTE ================== */
app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.status(200).send(`API ONLINE 🚀 ${result.rows[0].now}`);
  } catch (err) {
    console.error("❌ ERRO DB:", err);
    res.status(500).send("Erro ao conectar ao banco");
  }
});

/* ================== MIDDLEWARE DE ERRO ================== */
app.use((err, req, res, next) => {
  console.error("❌ Middleware de erro:", err.message);

  // se for CORS, apenas bloqueia sem quebrar login
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "CORS bloqueado: origem não permitida" });
  }

  // outros erros
  res.status(500).json({ message: "Erro interno do servidor" });
});

/* ================== START ================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 API rodando na porta ${PORT}`);
});
