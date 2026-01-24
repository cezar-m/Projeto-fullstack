import express from "express";
import cors from "cors";
import db from "./db.js";

import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import productRoutes from "./routes/products.routes.js";

const app = express();

/* ================== CORS ================== */
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://projeto-fullstack-dusky.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());

/* ================== BODY ================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================== ROTAS ================== */
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/products", productRoutes);

/* ================== TESTE ================== */
app.get("/", (req, res) => {
  res.status(200).send("API ONLINE 🚀");
});

/* ================== START ================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 API rodando na porta ${PORT}`);
});
