import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db.js";
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import productRoutes from "./routes/products.routes.js";

dotenv.config();

const app = express();

// Lista de domínios permitidos
const allowedOrigins = [
  "http://localhost:5173",
  "https://projeto-fullstack-dusky.vercel.app"
];

app.use(cors({
  origin: function(origin, callback) {
    // Permite requisições sem origin (Postman, servidor)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `O CORS não permite acesso de: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // necessário para cookies
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors()); // para preflight requests

// BODY
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROTAS
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/products", productRoutes);

// TESTE
app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.status(200).send(`API ONLINE 🚀 Banco conectado: ${result.rows[0].now}`);
  } catch (err) {
    console.error("❌ ERRO conexão DB:", err);
    res.status(500).send("Erro ao conectar ao banco");
  }
});

// START
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 API rodando na porta ${PORT}`);
});
