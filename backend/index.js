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
// ✅ CORS correto para JWT + Render + Vercel
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://projeto-fullstack-dusky.vercel.app",
  "https://projeto-fullstack-seven.vercel.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite Postman / SSR
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn("❌ CORS bloqueado:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

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

    console.log("✅ Tabelas criadas/verificadas com sucesso");
  } catch (error) {
    console.error("❌ Erro ao criar tabelas:", error);
  }
};

// ❗ Nunca criar tabelas em produção
if (process.env.NODE_ENV !== "production") {
  createTables();
}

/* ================== ROTA TESTE ================== */
app.get("/", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT NOW()");
    res.status(200).send(`API ONLINE 🚀 ${rows[0].now}`);
  } catch (error) {
    console.error("❌ ERRO DB:", error);
    res.status(500).json({ message: "Erro ao conectar ao banco" });
  }
});

/* ================== MIDDLEWARE ERRO GLOBAL ================== */
app.use((err, req, res, next) => {
  console.error("❌ ERRO GLOBAL:", err.message);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      message: "CORS bloqueado: origem não permitida"
    });
  }

  return res.status(500).json({
    message: "Erro interno do servidor"
  });
});

/* ================== START ================== */
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 API rodando na porta ${PORT}`);
});
