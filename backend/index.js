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

/* ================== CORS (SEM QUEBRAR LOGIN) ================== */
/*
  ❗ Regra:
  - Browser precisa de preflight (OPTIONS)
  - Nunca lançar erro no CORS
  - Render + Vercel funcionam juntos
*/
app.use(
  cors({
    origin: true, // ✅ aceita qualquer origem válida (Vercel, Render, localhost)
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// ✅ responde preflight
app.options("*", cors());

/* ================== BODY PARSER ================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================== ROTAS ================== */
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/products", productRoutes);

/* ================== BANCO (APENAS DEV) ================== */
const createTables = async () => {
  try {
   /* ================== BANCO (APENAS DEV) ================== */
const createTables = async () => {
  try {
    // 🔹 USUÁRIOS
    await db.query(`
      CREATE TABLE IF NOT EXISTS public.usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        acesso VARCHAR(50) NOT NULL
      );
    `);

    // 🔹 PRODUTOS (1 usuário → N produtos)
    await db.query(`
      CREATE TABLE IF NOT EXISTS public.produtos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        preco NUMERIC(10,2) NOT NULL,
        descricao TEXT,
        quantidade INT DEFAULT 0,
        imagem VARCHAR(255),

        id_usuario INT NOT NULL,

        CONSTRAINT fk_usuario
          FOREIGN KEY (id_usuario)
          REFERENCES public.usuarios(id)
          ON DELETE CASCADE
      );
    `);

    console.log("✅ Banco OK (tabelas prontas)");
  } catch (err) {
    console.error("❌ Erro ao criar tabelas:", err.message);
  }
};

// ❗ NUNCA criar tabela em produção
if (process.env.NODE_ENV !== "production") {
  createTables();
}

/* ================== ROTA TESTE ================== */
app.get("/", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT NOW()");
    res.send(`API ONLINE 🚀 ${rows[0].now}`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro no banco" });
  }
});

/* ================== ERRO GLOBAL ================== */
app.use((err, req, res, next) => {
  console.error("❌ ERRO GLOBAL:", err);
  res.status(500).json({ message: "Erro interno do servidor" });
});

/* ================== START ================== */
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 API rodando na porta ${PORT}`);
});

