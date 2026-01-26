// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db.js"; // seu pool do pg
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import productRoutes from "./routes/products.routes.js";

dotenv.config();
const app = express();

/* ================== CORS ================== */
const allowedOrigins = [
  "http://localhost:5173",
  /^https:\/\/.*\.vercel\.app$/ // qualquer subdomínio da Vercel
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.some(o => (o instanceof RegExp ? o.test(origin) : o === origin))) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

// Middleware principal
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* ================== BODY PARSER ================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================== ROTAS ================== */
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/products", productRoutes);

/* ================== FUNÇÃO DE CRIAÇÃO DE TABELAS ================== */
const createTables = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        acesso VARCHAR(50) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS produtos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        preco DECIMAL(10,2) NOT NULL,
        descricao TEXT,
        quantidade INT DEFAULT 0,
        imagem VARCHAR(255),
        id_usuario INT REFERENCES usuarios(id)
      );
    `);
    console.log("✅ Tabelas criadas/verificadas com sucesso!");
  } catch (err) {
    console.error("❌ ERRO ao criar tabelas:", err);
  }
};

// Chama a função ao iniciar o servidor
createTables();

/* ================== TESTE ================== */
app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.status(200).send(`API ONLINE 🚀 Banco conectado: ${result.rows[0].now}`);
  } catch (err) {
    console.error("❌ ERRO conexão DB:", err);
    res.status(500).send("Erro ao conectar ao banco");
  }
});

/* ================== START ================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 API rodando na porta ${PORT}`);
});
