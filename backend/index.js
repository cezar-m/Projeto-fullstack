import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db.js";
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import productRoutes from "./routes/products.routes.js";

dotenv.config();

const app = express();

/* ================== CORS ================== */
const allowedOrigins = [
  "http://localhost:5173",
  "https://projeto-fullstack-dusky.vercel.app",
  "https://projeto-fullstack-five.vercel.app" // adicione aqui!
];

app.use(cors({
  origin: function(origin, callback) {
    // Permite Postman / server-side requests sem origin
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Preflight
app.options("*", cors({
  origin: allowedOrigins,
  credentials: true
}));

/* ================== BODY ================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================== ROTAS ================== */
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/products", productRoutes);

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

