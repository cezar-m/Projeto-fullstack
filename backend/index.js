import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import db from "./db.js";
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import productRoutes from "./routes/products.routes.js";

/* ================== ENV ================== */
dotenv.config();

/* ================== APP ================== */
const app = express();

/* ================== CORS ================== */
// ⚠️ CORS correto para token + multipart + Render/Vercel
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://projeto-fullstack-dusky.vercel.app",
  "https://projeto-fullstack-seven.vercel.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Postman / SSR

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn("❌ CORS bloqueado:", origin);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ================== BODY PARSER ================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================== ROTAS ================== */
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/products", productRoutes);

/* ================== CRIAR TABELAS (APENAS DEV) ================== */
const createTables = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS public.usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        acesso VARCHAR(50) NOT NULL
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS public.produtos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        preco NUMERIC(10,2) NOT NULL,
        descricao TEXT,
        quantidade INT DEFAULT 0,
        imagem VARCHAR(255),
        id_usuario INT REFERENCES public.usuarios(id) ON DELETE CASCADE
      );
    `);

    console.log("✅ Tabelas verificadas/criadas");
  } catch (err) {
    console.error("❌ Erro ao criar tabelas:", err);
  }
};

// ❗ NÃO criar tabelas em produção
if (process.env.NODE_ENV !== "production") {
  createTables();
}

/* ================== ROTA TESTE ================== */
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
  console.error("❌ ERRO GLOBAL:", err.message);

  if (err.message === "Not allowed by CORS") {
    return res
      .status(403)
      .json({ message: "CORS bloqueado: origem não permitida" });
  }

  res.status(500).json({ message: "Erro interno do servidor" });
});

/* ================== START ================== */
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 API rodando na porta ${PORT}`);
});

